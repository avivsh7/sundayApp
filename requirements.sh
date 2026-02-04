#!/bin/bash
echo "--- Starting SundayApp Setup ---"

kubectl create namespace sunday-app || true
kubectl create secret generic db-credentials --from-literal=password=mysecret -n sunday-app || true

echo "Building Backend..."
docker build -t sunday-backend:v1.5 ./backend

echo "Building Go Controller..."
docker build -t ethereal-controller:v1 ./etherealpod-controller

echo "Building Frontend..."
docker build -t sunday-frontend:v1.0 ./frontend

echo "Applying Bundle..."
kubectl apply -f k8s/submission.yaml


echo "Starting Port-Forwarding..."
kubectl port-forward svc/ethereal-backend-svc 30001:8080 -n sunday-app &
sleep 1
echo "Done! Access the app at: http://localhost:30002"
echo "Backend API is reachable at: http://localhost:30001"