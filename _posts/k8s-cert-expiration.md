---
layout: single
author_profile: true
title:  "Renew k8s Cluster Certificates"
summary: "Your cluster certificates expired, what do you do now?"
read_time: true
comments: true
share: false
related: false
collection: examples
---

## Backup the Certs and Configs

```
cp -R /etc/kubernetes/ssl /etc/kubernetes/ssl.backup
cp /etc/kubernetes/admin.conf /etc/kubernetes/admin.conf.backup
cp /etc/kubernetes/controller-manager.conf /etc/kubernetes/controller-manager.conf.backup
cp /etc/kubernetes/kubelet.conf /etc/kubernetes/kubelet.conf.backup
cp /etc/kubernetes/scheduler.conf /etc/kubernetes/scheduler.conf.backup
```

## Now user kubeadm to upgrade the certs 
* Note:  1.15 and above....

```
export https_proxy=proxyserver:3128
export no_proxy=172.18.2.220,172.18.2.221,172.18.2.222
export PATH=/usr/local/bin:$PATH
kubeadm alpha certs renew apiserver-kubelet-client
kubeadm alpha certs renew apiserver
kubeadm alpha certs renew front-proxy-client
kubeadm alpha kubeconfig user --apiserver-advertise-address 172.18.2.220 --client-name system:kube-controller-manager > /etc/kubernetes/controller-manager.conf
kubeadm alpha kubeconfig user --apiserver-advertise-address 172.18.2.220 --client-name system:kube-scheduler > /etc/kubernetes/scheduler.conf
kubeadm alpha kubeconfig user --apiserver-advertise-address 172.18.2.220 --client-name system:node:iahlvlkubfed1 --org system:nodes > /etc/kubernetes/kubelet.conf
kubeadm alpha kubeconfig user --apiserver-advertise-address 172.18.2.220 --client-name kubernetes-admin --org system:masters > /etc/kubernetes/admin.conf
cp  /etc/kubernetes/admin.conf ~/.kube/config
```

## Master Node
```
export https_proxy=iahlproxy.logistics.corp:3128
export no_proxy=172.18.2.220,172.18.2.221,172.18.2.222
export PATH=/usr/local/bin:$PATH
kubeadm upgrade apply v1.16.9
```


## Additional Master Nodes
```
export https_proxy=iahlproxy.logistics.corp:3128
export no_proxy=172.18.2.220,172.18.2.221,172.18.2.222
export PATH=/usr/local/bin:$PATH
kubeadm upgrade node
```



## Restart kubelet and Services

service kubelet stop
service kubelet start
k delete pod $(k get pods -n kube-system | egrep 'apiserver|controller|scheduler' | awk '{print $1}' | xargs )
