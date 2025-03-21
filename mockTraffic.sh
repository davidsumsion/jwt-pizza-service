


#!/bin/bash

# Check if host is provided as a command line argument
if [ -z "$1" ]; then
  echo "Usage: $0 <host>"
  echo "Example: $0 http://localhost:3000"
  exit 1
fi
host=$1

# Check if token is provided as a command line argument
if [ -z "$2" ]; then
  echo "Usage: $0 <token>"
  echo "Example: $0 sldkfjsdklfjslkdfjs"
  exit 1
fi
token=$2

echo "starting process"


# Function to cleanly exit
cleanup() {
  echo "Terminating background processes..."
  kill $pid1 $pid2 $pid3
  exit 0
}

# Trap SIGINT (Ctrl+C) to execute the cleanup function
trap cleanup SIGINT

# Simulate a log in
# while true; do
#   curl -v -X PUT \
#   -H "Content-Type: application/json" \
#   -d '{
#     "name": "TEST 1",
#     "email": "t@gmail.com",
#     "password": "fakepassword"
#   }' \
#   $host/api/auth
#   echo "Logging in User..."
#   sleep $((RANDOM % 2 + 1))
# done &
# pid1=$!



# # Simulate deleting a greeting
# while true; do
#   curl -s -X DELETE "$host/greeting" > /dev/null
#   echo "Deleting greeting..."
#   sleep $((RANDOM % 10 + 1))
# done &
# pid3=$!



# # # get order
# while true; do
#   curl -s $host/api/order/menu
#   sleep 3
# done
# pid4=$!

# make order
 while true; do
  # make order
  curl -s -X POST $host/api/order -H 'Content-Type: application/json' -d '{"franchiseId": 40, "storeId":10, "items":[{ "menuId": 10, "description": "No toppings, no sauces, just carb", "price": 0.50 }]}'  -H "Authorization: Bearer $token"
  sleep 1
done
pid5=$!

# 



# Wait for the background processes to complete
wait $pid1 $pid3 $pid4 $pid5