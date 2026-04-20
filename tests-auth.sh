#!/bin/bash

BASE_URL="http://localhost:3000"

EMAIL="test@test.com"
PASSWORD="123456"

echo "----------------------------"
echo "1. REGISTER"
echo "----------------------------"

curl -X POST $BASE_URL/auth/register \
-H "Content-Type: application/json" \
-d "{
  \"email\": \"$EMAIL\",
  \"password\": \"$PASSWORD\"
}"

echo ""
echo ""
echo "👉 regarde la console NestJS pour récupérer EMAIL CODE"
echo ""
read -p "Copie le EMAIL CODE ici: " EMAIL_CODE


echo ""
echo "----------------------------"
echo "2. VERIFY EMAIL"
echo "----------------------------"

curl -X POST $BASE_URL/auth/verify-email \
-H "Content-Type: application/json" \
-d "{
  \"email\": \"$EMAIL\",
  \"code\": \"$EMAIL_CODE\"
}"

echo ""
echo ""
echo "----------------------------"
echo "3. LOGIN"
echo "----------------------------"

curl -X POST $BASE_URL/auth/login \
-H "Content-Type: application/json" \
-d "{
  \"email\": \"$EMAIL\",
  \"password\": \"$PASSWORD\"
}"

echo ""
echo ""
echo "👉 regarde la console NestJS pour récupérer 2FA CODE"
echo ""
read -p "Copie le 2FA CODE ici: " TWO_FA_CODE


echo ""
echo "----------------------------"
echo "4. VERIFY 2FA (GET JWT)"
echo "----------------------------"

TOKEN=$(curl -s -X POST $BASE_URL/auth/verify-2fa \
-H "Content-Type: application/json" \
-d "{
  \"email\": \"$EMAIL\",
  \"code\": \"$TWO_FA_CODE\"
}" | sed -E 's/.*"access_token":"([^"]+)".*/\1/')

echo ""
echo "TOKEN:"
echo $TOKEN


echo ""
echo "----------------------------"
echo "5. TEST ROUTE PRIVÉE (plus tard)"
echo "----------------------------"

curl -X GET $BASE_URL/users/me \
-H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "FIN DU TEST"
