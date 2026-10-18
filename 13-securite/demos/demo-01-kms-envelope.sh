#!/usr/bin/env bash
# Démo — envelope encryption avec KMS et openssl
set -euo pipefail
ALIAS="alias/demo-envelope"
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT

KEY_ID=$(aws kms create-key --description "demo envelope" --query KeyMetadata.KeyId --output text)
aws kms create-alias --alias-name "$ALIAS" --target-key-id "$KEY_ID"

echo "Données secrètes : numéro de carte 4111-1111-1111-1111" > "$TMP/secret.txt"

# 1) Clé de données : une version en clair (usage local), une chiffrée par la CMK (à stocker)
aws kms generate-data-key --key-id "$ALIAS" --key-spec AES_256 --output json > "$TMP/dk.json"
jq -r .Plaintext      "$TMP/dk.json" | base64 -d > "$TMP/dk.plain"
jq -r .CiphertextBlob "$TMP/dk.json" | base64 -d > "$TMP/dk.enc"

# 2) Chiffrement local, puis destruction de la clé en clair
openssl enc -aes-256-cbc -pbkdf2 -in "$TMP/secret.txt" -out "$TMP/secret.enc" -pass file:"$TMP/dk.plain"
shred -u "$TMP/dk.plain" "$TMP/dk.json" 2>/dev/null || rm -f "$TMP/dk.plain" "$TMP/dk.json"
echo "Stocké : secret.enc + dk.enc (clé de données chiffrée). Aucun secret en clair."

# 3) Déchiffrement : KMS déchiffre la clé de données, puis déchiffrement local
aws kms decrypt --ciphertext-blob "fileb://$TMP/dk.enc" --query Plaintext --output text | base64 -d > "$TMP/dk.plain"
openssl enc -d -aes-256-cbc -pbkdf2 -in "$TMP/secret.enc" -pass file:"$TMP/dk.plain"

echo "Nettoyage :"
echo "aws kms delete-alias --alias-name $ALIAS; aws kms schedule-key-deletion --key-id $KEY_ID --pending-window-in-days 7"
