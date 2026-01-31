package controller

import (
	"context"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"

	v1 "sundayapp/etherealpod-controller/api/v1"
)

type EtherealPodReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}


func (r *EtherealPodReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	// Fetch the EtherealPod instance
	ep := &v1.EtherealPod{}
	if err := r.Get(ctx, req.NamespacedName, ep); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// Check if the Pod already exists
	foundPod := &corev1.Pod{}
	err := r.Get(ctx, client.ObjectKey{Name: ep.Name, Namespace: ep.Namespace}, foundPod)

	if err != nil && errors.IsNotFound(err) {
		// --- SELF HEALING ---
		newPod := r.buildPod(ep)
		if err := r.Create(ctx, newPod); err != nil {
			return ctrl.Result{}, err
		}
		return ctrl.Result{Requeue: true}, nil
	} else if err != nil {
		return ctrl.Result{}, err
	}

	if len(foundPod.Status.ContainerStatuses) > 0 {
		restarts := int(foundPod.Status.ContainerStatuses[0].RestartCount)
		if ep.Status.Restarts != restarts {
			ep.Status.Restarts = restarts
			if err := r.Status().Update(ctx, ep); err != nil {
				return ctrl.Result{}, err
			}
		}
	}

	return ctrl.Result{}, nil
}

func (r *EtherealPodReconciler) buildPod(ep *v1.EtherealPod) *corev1.Pod {
	return &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      ep.Name,
			Namespace: ep.Namespace,
			Labels:    map[string]string{"app": "ethereal-backend", "managed-by": ep.Name},
			OwnerReferences: []metav1.OwnerReference{
				*metav1.NewControllerRef(ep, v1.GroupVersion.WithKind("EtherealPod")),
			},
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{
					Name:  "backend",
					Image: ep.Spec.Image,
					Ports: []corev1.ContainerPort{{ContainerPort: 3000}},

					Env: []corev1.EnvVar{
						{
							Name:  "DB_HOST",
							Value: "ethereal-db-svc",
						},
						{
							Name: "DB_USER",
							Value: "postgres",
						},
						{
							Name: "DB_NAME",
							Value: "postgres",
						},
						{
							Name:  "DB_PORT",
							Value: "5432",
						},
						{
							Name: "POSTGRES_PASSWORD",
							ValueFrom: &corev1.EnvVarSource{
								SecretKeyRef: &corev1.SecretKeySelector{
									LocalObjectReference: corev1.LocalObjectReference{
										Name: "db-credentials", 
									},
									Key: "password",
								},
							},
						},
					},
				},
			},
		},
	}
}

func (r *EtherealPodReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&v1.EtherealPod{}).
		Owns(&corev1.Pod{}).
		Complete(r)
}