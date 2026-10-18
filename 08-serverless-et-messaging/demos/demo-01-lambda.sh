#!/usr/bin/env bash
# Démo — créer, invoquer et observer une Lambda en CLI
set -euo pipefail
FN=demo-hello
ROLE=demo-lambda-role
TMP=$(mktemp -d)

cat > "$TMP/index.py" <<'PY'
import json, os
def handler(event, context):
    print("event:", json.dumps(event))
    return {"message": f"Bonjour {event.get('name','monde')}", "region": os.environ["AWS_REGION"]}
PY
(cd "$TMP" && zip -q fn.zip index.py)

aws iam create-role --role-name $ROLE --assume-role-policy-document '{
 "Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' >/dev/null 2>&1 || true
aws iam attach-role-policy --role-name $ROLE --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
sleep 10
ROLE_ARN=$(aws iam get-role --role-name $ROLE --query Role.Arn --output text)

aws lambda create-function --function-name $FN --runtime python3.12 --architectures arm64 \
  --handler index.handler --role "$ROLE_ARN" --zip-file "fileb://$TMP/fn.zip" >/dev/null
aws lambda wait function-active-v2 --function-name $FN

aws lambda invoke --function-name $FN --cli-binary-format raw-in-base64-out \
  --payload '{"name":"AWS"}' --log-type Tail "$TMP/out.json" \
  --query 'LogResult' --output text | base64 -d
echo; cat "$TMP/out.json"; echo

echo "Nettoyage :"
echo "aws lambda delete-function --function-name $FN; aws iam detach-role-policy --role-name $ROLE --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole; aws iam delete-role --role-name $ROLE"
