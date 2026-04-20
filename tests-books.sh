#!/bin/bash

BASE_URL="http://localhost:3000"

echo "============================"
echo "TEST BOOKS API"
echo "============================"
echo ""

read -p "Colle ton JWT ici: " TOKEN

echo ""
echo "----------------------------"
echo "1. CREATE BOOK"
echo "----------------------------"

CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Le Petit Prince",
    "author": "Antoine de Saint-Exupéry",
    "status": "TO_READ"
  }')

echo "$CREATE_RESPONSE"
echo ""

BOOK_ID=$(echo "$CREATE_RESPONSE" | sed -E 's/.*"id":([0-9]+).*/\1/')

echo "BOOK_ID détecté: $BOOK_ID"
echo ""

echo "----------------------------"
echo "2. GET MY BOOKS"
echo "----------------------------"

curl -s -X GET $BASE_URL/books \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "----------------------------"
echo "3. UPDATE BOOK"
echo "----------------------------"

curl -s -X PATCH $BASE_URL/books/$BOOK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "DONE"
  }'

echo ""
echo ""
echo "----------------------------"
echo "4. GET MY BOOKS AFTER UPDATE"
echo "----------------------------"

curl -s -X GET $BASE_URL/books \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "----------------------------"
echo "5. DELETE BOOK"
echo "----------------------------"

curl -s -X DELETE $BASE_URL/books/$BOOK_ID \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "----------------------------"
echo "6. GET MY BOOKS AFTER DELETE"
echo "----------------------------"

curl -s -X GET $BASE_URL/books \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "----------------------------"
echo "7. TEST ADMIN ROUTE"
echo "----------------------------"

curl -s -X GET $BASE_URL/books/all \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "============================"
echo "FIN DES TESTS"
echo "============================"
