package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
)

type EtherealPodSpec struct {
    Image string `json:"image"`
}

type EtherealPodStatus struct {
    Restarts int `json:"restarts"`
}



type EtherealPod struct {
    metav1.TypeMeta   `json:",inline"`
    metav1.ObjectMeta `json:"metadata,omitempty"`

    Spec   EtherealPodSpec   `json:"spec,omitempty"`
    Status EtherealPodStatus `json:"status,omitempty"`
}

type EtherealPodList struct {
    metav1.TypeMeta `json:",inline"`
    metav1.ListMeta `json:"metadata,omitempty"`
    Items           []EtherealPod `json:"items"`
}

func (in *EtherealPod) DeepCopyInto(out *EtherealPod) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ObjectMeta.DeepCopyInto(&out.ObjectMeta)
	out.Spec = in.Spec
	out.Status = in.Status
}

func (in *EtherealPod) DeepCopy() *EtherealPod {
	if in == nil {
		return nil
	}
	out := new(EtherealPod)
	in.DeepCopyInto(out)
	return out
}

func (in *EtherealPod) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

func (in *EtherealPodList) DeepCopyInto(out *EtherealPodList) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ListMeta.DeepCopyInto(&out.ListMeta)
	if in.Items != nil {
		in, out := &in.Items, &out.Items
		*out = make([]EtherealPod, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
}

func (in *EtherealPodList) DeepCopy() *EtherealPodList {
	if in == nil {
		return nil
	}
	out := new(EtherealPodList)
	in.DeepCopyInto(out)
	return out
}

func (in *EtherealPodList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}