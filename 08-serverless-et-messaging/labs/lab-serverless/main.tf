terraform {
  required_version = ">= 1.6"
  required_providers {
    aws     = { source = "hashicorp/aws", version = "~> 5.0" }
    archive = { source = "hashicorp/archive", version = "~> 2.4" }
  }
}

variable "region" {
  type    = string
  default = "eu-west-3"
}

provider "aws" {
  region = var.region
  default_tags { tags = { Projet = "formation-aws", Module = "08" } }
}

# ---------- Données ----------
resource "aws_dynamodb_table" "tasks" {
  name         = "lab08-tasks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
}

# ---------- Messaging ----------
resource "aws_sns_topic" "tasks" { name = "lab08-tasks" }

resource "aws_sqs_queue" "dlq" {
  name                      = "lab08-tasks-dlq"
  message_retention_seconds = 1209600
}

resource "aws_sqs_queue" "tasks" {
  name                       = "lab08-tasks"
  visibility_timeout_seconds = 60 # >= timeout Lambda (30 s) x 2
  receive_wait_time_seconds  = 20 # long polling
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 3
  })
}

data "aws_iam_policy_document" "sns_to_sqs" {
  statement {
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.tasks.arn]
    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }
    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_sns_topic.tasks.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "tasks" {
  queue_url = aws_sqs_queue.tasks.id
  policy    = data.aws_iam_policy_document.sns_to_sqs.json
}

resource "aws_sns_topic_subscription" "tasks" {
  topic_arn = aws_sns_topic.tasks.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.tasks.arn
}

# ---------- Packaging ----------
data "archive_file" "api" {
  type        = "zip"
  source_file = "${path.module}/src/api.py"
  output_path = "${path.module}/build/api.zip"
}

data "archive_file" "worker" {
  type        = "zip"
  source_file = "${path.module}/src/worker.py"
  output_path = "${path.module}/build/worker.zip"
}

# ---------- IAM : un rôle par fonction ----------
data "aws_iam_policy_document" "lambda_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "api" {
  name               = "lab08-api"
  assume_role_policy = data.aws_iam_policy_document.lambda_trust.json
}

resource "aws_iam_role_policy_attachment" "api_logs" {
  role       = aws_iam_role.api.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "api" {
  statement {
    actions   = ["dynamodb:PutItem", "dynamodb:GetItem"]
    resources = [aws_dynamodb_table.tasks.arn]
  }
  statement {
    actions   = ["sns:Publish"]
    resources = [aws_sns_topic.tasks.arn]
  }
}

resource "aws_iam_role_policy" "api" {
  role   = aws_iam_role.api.id
  policy = data.aws_iam_policy_document.api.json
}

resource "aws_iam_role" "worker" {
  name               = "lab08-worker"
  assume_role_policy = data.aws_iam_policy_document.lambda_trust.json
}

resource "aws_iam_role_policy_attachment" "worker_logs" {
  role       = aws_iam_role.worker.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "worker" {
  statement {
    actions   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
    resources = [aws_sqs_queue.tasks.arn]
  }
}

resource "aws_iam_role_policy" "worker" {
  role   = aws_iam_role.worker.id
  policy = data.aws_iam_policy_document.worker.json
}

# ---------- Fonctions ----------
resource "aws_lambda_function" "api" {
  function_name    = "lab08-api"
  role             = aws_iam_role.api.arn
  runtime          = "python3.12"
  architectures    = ["arm64"]
  handler          = "api.handler"
  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256
  timeout          = 10
  environment {
    variables = {
      TABLE     = aws_dynamodb_table.tasks.name
      TOPIC_ARN = aws_sns_topic.tasks.arn
    }
  }
}

resource "aws_lambda_function" "worker" {
  function_name    = "lab08-worker"
  role             = aws_iam_role.worker.arn
  runtime          = "python3.12"
  architectures    = ["arm64"]
  handler          = "worker.handler"
  filename         = data.archive_file.worker.output_path
  source_code_hash = data.archive_file.worker.output_base64sha256
  timeout          = 30
}

resource "aws_lambda_event_source_mapping" "worker" {
  event_source_arn        = aws_sqs_queue.tasks.arn
  function_name           = aws_lambda_function.worker.arn
  batch_size              = 5
  function_response_types = ["ReportBatchItemFailures"]
}

# ---------- API Gateway (HTTP API) ----------
resource "aws_apigatewayv2_api" "http" {
  name          = "lab08-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "api" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "post" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /tasks"
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}

resource "aws_apigatewayv2_route" "get" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /tasks/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

output "api_url" { value = aws_apigatewayv2_stage.default.invoke_url }
output "dlq_url" { value = aws_sqs_queue.dlq.id }
output "topic_arn" { value = aws_sns_topic.tasks.arn }
