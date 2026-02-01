#!/bin/bash
echo "--- Starting SundayApp Setup ---"

kubectl create namespace sunday-app || true
kubectl create secret generic db-credentials --from-literal=password=mysecret -n sunday-app || true

echo "Building Backend..."
docker build -t sunday-backend:v1.5 ./backend

echo "Building Frontend..."
docker build -t sunday-frontend:v1.0 ./frontend

echo "Applying Bundle..."
kubectl apply -f k8s/submission.yaml

echo "Launching Apps..."
(cd etherealpod-controller && go run main.go) & 
sleep 2

echo "Starting Frontend..."
echo "Done! Access the app at: http://localhost:30002"