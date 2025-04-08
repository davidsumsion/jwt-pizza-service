#!/bin/bash
host=https://pizza-service.pizza324.click

echo "starting process"

cleanup() {
  echo "Terminating background processes..."
  kill $pid1
  exit 0
}

# Trap SIGINT (Ctrl+C) to execute the cleanup function
trap cleanup SIGINT


random_string=$(head -c 16 /dev/urandom | base64)
# echo $random_string

while true; do

# Make the first API request to get the token
response=$(curl -s -X POST $host/api/auth \
  -H "Content-Type: application/json" \
  -d "{
        \"name\": \"myFirstName12 myLastName12\",
        \"email\": \"$random_string@email.com\",
        \"password\": \"myPassword12\"
}")

token=$(echo $response | jq -r '.token')
sleep 3
response=$(curl -s -X POST $host/api/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "items": [
        {
            "menuId": 1,
            "description": "Veggie",
            "price": 0.0038
        }
    ],
    "storeId": "1",
    "franchiseId": 1
}')
sleep 3
response=$(curl -s -X DELETE $host/api/auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" )
echo $response
sleep 10
done&
pid1=$!


# Wait for the background processes to complete
wait $pid1
