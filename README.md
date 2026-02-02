SundayApp - Kubernetes Inventory Management System
A cloud-native inventory management system using a Custom Kubernetes Operator to manage backend lifecycles.

How to Run
Prerequisites:
Docker Desktop with Kubernetes enabled.
Start a cluster.

Go (for the controller).

Node.js and npm (for the frontend).

Git Bash (to run the setup script on Windows).

Quick Start
Clone the repository and navigate to the root folder.

Run the automated setup script:

Open Git Bash Terminal

Type and enter:
sh requirements.sh
This script cleans old processes on port 5173, builds the backend image, applies Kubernetes manifests, and launches the Controller and Frontend in separate processes.

Architecture Decisions
1. Custom Operator (EtherealPod)
Instead of a standard Deployment, the system uses a Custom Resource Definition (CRD) called EtherealPod.

Controller Logic: Written in Go using the controller-runtime library. It monitors EtherealPod resources and manages the underlying Pods.

Self-Healing: The controller implements a reconciliation loop. If a backend Pod is deleted, the controller identifies the mismatch and recreates the Pod.

Status Tracking: The controller observes container restarts and updates the EtherealPod status, making the data visible via kubectl get eps.

2. Persistence with StatefulSet
The PostgreSQL database is deployed as a StatefulSet.

Stable Identity: Ensures the database pod maintains a consistent hostname (ethereal-db-0).

Storage Persistence: Uses volumeClaimTemplates to ensure that data remains intact even if the pod is rescheduled or restarted.

3. Networking and Security
Service Layer: The backend is exposed via a NodePort Service (Port 30001) for host-machine access.

Secrets Management: Sensitive database credentials are not hardcoded but managed through Kubernetes Secrets and injected as environment variables.

Assumptions and Notes
Environment: The solution is designed for local development using Docker Desktop's Kubernetes cluster.

Port Management: The startup script automatically manages and clears ports 30001 and 30002 to ensure a clean deployment.