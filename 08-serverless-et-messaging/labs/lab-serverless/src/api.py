import json
import os
import time
import uuid

import boto3

dynamodb = boto3.resource("dynamodb")
sns = boto3.client("sns")
table = dynamodb.Table(os.environ["TABLE"])
TOPIC = os.environ["TOPIC_ARN"]


def _resp(code, body):
    return {
        "statusCode": code,
        "headers": {"content-type": "application/json"},
        "body": json.dumps(body),
    }


def handler(event, context):
    route = event["routeKey"]

    if route == "POST /tasks":
        try:
            payload = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return _resp(400, {"error": "JSON invalide"})
        if "title" not in payload:
            return _resp(400, {"error": "title requis"})

        task = {
            "id": str(uuid.uuid4()),
            "title": payload["title"],
            "status": "NEW",
            "created_at": int(time.time()),
        }
        table.put_item(Item=task)
        sns.publish(TopicArn=TOPIC, Message=json.dumps(task))
        return _resp(201, task)

    if route == "GET /tasks/{id}":
        item = table.get_item(Key={"id": event["pathParameters"]["id"]}).get("Item")
        return _resp(200, item) if item else _resp(404, {"error": "introuvable"})

    return _resp(404, {"error": "route inconnue"})
