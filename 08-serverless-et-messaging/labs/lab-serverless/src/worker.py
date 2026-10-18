import json


def handler(event, context):
    """Traite un lot SQS (message SNS enveloppé). Retourne les échecs partiels."""
    failures = []
    for record in event["Records"]:
        try:
            envelope = json.loads(record["body"])          # enveloppe SNS
            task = json.loads(envelope["Message"])
            if task.get("fail"):
                raise ValueError("échec simulé")
            print(json.dumps({"msg": "tâche traitée", "id": task.get("id"), "title": task.get("title")}))
        except Exception as exc:  # noqa: BLE001
            print(json.dumps({"msg": "échec", "error": str(exc), "messageId": record["messageId"]}))
            failures.append({"itemIdentifier": record["messageId"]})
    return {"batchItemFailures": failures}
