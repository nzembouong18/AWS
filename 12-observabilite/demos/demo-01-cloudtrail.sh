#!/usr/bin/env bash
# Démo — enquête CloudTrail : qui a fait quoi ?
set -euo pipefail
EVENT="${1:-StopInstances}"
START=$(date -u -d '-24 hours' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-24H +%Y-%m-%dT%H:%M:%SZ)

aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue="$EVENT" \
  --start-time "$START" --max-results 20 \
  --query 'Events[].{Heure:EventTime,Qui:Username,Source:EventSource}' --output table

echo "--- Détail du dernier événement (IP source, user-agent) ---"
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue="$EVENT" --max-results 1 \
  --query 'Events[0].CloudTrailEvent' --output text \
  | jq '{eventTime, userIdentity: .userIdentity.arn, sourceIPAddress, userAgent, requestParameters}'
