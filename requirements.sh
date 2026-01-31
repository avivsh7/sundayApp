echo "--- Starting SundayApp Setup ---"

kubectl create namespace sunday-app
kubectl create secret generic db-credentials --from-literal=password=mysecret -n sunday-app

echo "Building Backend..."

docker build -t sunday-backend:v1.5 ./backend

echo "Applying Bundle..."
kubectl apply -f k8s/submission.yaml

echo "Launching Apps..."
(cd etherealpod-controller && go run main.go) & 

echo "Starting Frontend..."
cd frontend && npm run dev