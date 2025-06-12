---
layout: post
title:  "Setup K3s Cluster"
excerpt_separator: <!--more-->
header:
  xxxteaser: /assets/images/twitter-card.png
---
By default Rancher K3S comes with Traefik 1.7. We will setup K3S without Traefik ingress in this tutorial.

Execute below command on master node 1.
curl -sfL https://get.k3s.io | sh -s - server   --datastore-endpoint="mysql://user:pass@tcp(ip_address:3306)/databasename" --disable traefik --node-taint CriticalAddonsOnly=true:NoExecute --tls-san 192.168.1.2 --tls-san k3s.home.lab
Execute above command on master node 2 to setup HA.
Validate cluster setup:
<!--more-->

 
sudo kubectl get node
NAME           STATUS   ROLES    AGE    VERSION
k3s-master-1   Ready    master   3m9s   v1.18.9+k3s1
Make sure you have HA Proxy Setup:

##########################################################
#               Kubernetes AP ILB
##########################################################
frontend kubernetes-frontend
    bind 192.168.1.2:6443
    mode tcp
    option tcplog
    default_backend kubernetes-backend

backend kubernetes-backend
    mode tcp
    option tcp-check
    balance roundrobin
    server k3s-master-1 192.168.1.10:6443 check fall 3 rise 2
    server k3s-master-2 192.168.1.20:6443 check fall 3 rise 2
Join worker nodes to K3S Cluster
Get node token from one of the master node by executing below command:
sudo cat /var/lib/rancher/k3s/server/node-token
K105c8c5de8deac516ebgd454r45547481d70625ee3e5200acdbe8ea071191debd4::server:gd5de354807077fde4259fd9632ea045454
We will use above command output value to join worker nodes:


 
curl -sfL https://get.k3s.io | K3S_URL=https://192.168.1.2:6443 K3S_TOKEN={{USE_TOKEN_FROM_ABOVE}} sh -
Validate K3S cluster state:
NAME                STATUS   ROLES    AGE     VERSION
k3s-master-1        Ready    master   15m     v1.18.9+k3s1
k3s-worker-node-1   Ready    <none>   3m44s   v1.18.9+k3s1
k3s-worker-node-2   Ready    <none>   2m52s   v1.18.9+k3s1
k3s-master-2        Ready    master   11m     v1.18.9+k3s1
MetalLB Setup
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.4/manifests/namespace.yaml
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.4/manifests/metallb.yaml

 
kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
Create a file called metallb-config.yaml and enter below values:

apiVersion: v1
kind: ConfigMap
metadata:
    namespace: metallb-system
    name: config
data:
  config: |
    address-pools:
    - name: default
      protocol: layer2
      addresses:
      - 192.168.1.240-192.168.1.250
Apply changes:

sudo kubectl apply -f metallb-config.yaml
Deploy sample application with service
kubectl create deploy nginx --image nginx
kubectl expose deploy nginx --port 80
Check status:

kubectl get svc,pods
NAME                                              TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)                      AGE
service/kubernetes                                ClusterIP      10.43.0.1       <none>          443/TCP                      44m
service/nginx                                     ClusterIP      10.43.14.116    <none>          80/TCP                       31s

NAME                                                 READY   STATUS    RESTARTS   AGE
pod/nginx-f89759699-25lpb                            1/1     Running   0          59s
Nginx Ingress setup
In this tutorial, I will be using helm to setup nginx ingress controller.

Execute below commands to setup nginx ingress from client machine with helm, kubectl configured:
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install home ingress-nginx/ingress-nginx
Check Ingress controller status:

kubectl --namespace default get services -o wide -w home-ingress-nginx-controller
Setup Ingress by creating home-ingress.yaml and add below values. Replace example.io
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: nginx
  name: home-ingress
  namespace: default
spec:
  rules:
    - host: example.io
      http:
        paths:
          - backend:
              serviceName: nginx
              servicePort: 80
            path: /
Execute command to apply:

 kubectl apply -f home-ingress.yaml
Check Status on Ingress:

kubectl get ing
NAME           CLASS    HOSTS           ADDRESS         PORTS   AGE
home-ingress   <none>   example.io   192.168.1.240   80      8m26s
Letsencrypt setup
Execute below command to create namespaces, pods, and other related configurations:
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.0.3/cert-manager.yaml
Once above completes lets validate pods status.
2. Validate setup:


 
kubectl get pods --namespace cert-manager
NAME                                       READY   STATUS    RESTARTS   AGE
cert-manager-cainjector-76c9d55b6f-cp2jf   1/1     Running   0          39s
cert-manager-79c5f9946-qkfzv               1/1     Running   0          38s
cert-manager-webhook-6d4c5c44bb-4mdgc      1/1     Running   0          38s
Setup staging environment by applying below changes. Update email:
vi staging_issure.yaml
and paste below values and save the file:

apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
 name: letsencrypt-staging
spec:
 acme:
   # The ACME server URL
   server: https://acme-staging-v02.api.letsencrypt.org/directory
   # Email address used for ACME registration
   email: john@example.com
   # Name of a secret used to store the ACME account private key
   privateKeySecretRef:
     name: letsencrypt-staging
   # Enable the HTTP-01 challenge provider
   solvers:
   - http01:
       ingress:
         class:  nginx
Apply changes:

kubectl apply -f staging_issure.yaml
We will apply production issure later in this tutotial. We should first test SSL settings prior to making changes to use production certificates.

SSL setup with LetsEncrypt and Nginx Ingress
Before proceeding here, please make sure your dns is setup correctly from your cloud providor or in your homelab to allow traffic from internet. LetsEncrypt uses http validation to issue certificates and it needs to reach correct dns alias from where the cert request has been initiated.

Create new ingress file as shown below:

vi home-ingress-ssl.yaml
Copy and paste in above file:

apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/issuer: letsencrypt-staging
  name: home-ingress
  namespace: default
spec:
  tls:
  - hosts:
    - example.io
    secretName: home-example-io-tls
  rules:
  - host: example.io
    http:
      paths:
      - backend:
          serviceName: nginx
          servicePort: 80
        path: /
Apply changes:

kubectl apply -f home-ingress-ssl.yaml
Validate certificate creation:

kubectl describe certificate
Spec:
  Dns Names:
    example.io
  Issuer Ref:
    Group:      cert-manager.io
    Kind:       Issuer
    Name:       letsencrypt-staging
  Secret Name:  home-example-io-tls
Status:
  Conditions:
    Last Transition Time:        2020-10-26T20:19:15Z
    Message:                     Issuing certificate as Secret does not exist
    Reason:                      DoesNotExist
    Status:                      False
    Type:                        Ready
    Last Transition Time:        2020-10-26T20:19:18Z
    Message:                     Issuing certificate as Secret does not exist
    Reason:                      DoesNotExist
    Status:                      True
    Type:                        Issuing
  Next Private Key Secret Name:  home-example-io-tls-76dqg
Events:
  Type    Reason     Age   From          Message
  ----    ------     ----  ----          -------
  Normal  Issuing    10s   cert-manager  Issuing certificate as Secret does not exist
  Normal  Generated  8s    cert-manager  Stored new private key in temporary Secret resource "home-example-io-tls-76dqg"
  Normal  Requested  4s    cert-manager  Created new CertificateRequest resource "home-example-io-tls-h98zf"
Now you can browse your dns url and validate certificate. If you see something like below, that means your letsencrypt certificate management has been setup successfully.
nginx-ssl-tls-staging-certificate

Set production issure to get valid certificate
Create production issure:

vi production-issure.yaml
Copy and paste below values to above file. Update email:

apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
 name: letsencrypt-prod
spec:
 acme:
   # The ACME server URL
   server: https://acme-v02.api.letsencrypt.org/directory
   # Email address used for ACME registration
   email: user@example.com
   # Name of a secret used to store the ACME account private key
   privateKeySecretRef:
     name: letsencrypt-staging
   # Enable the HTTP-01 challenge provider
   solvers:
   - http01:
       ingress:
         class:  nginx

Apply changes:

kubectl apply -f production-issure.yaml
Update home-ingress-ssl.yaml file you created earlier with below values:

apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/issuer: letsencrypt-prod
  name: home-ingress
  namespace: default
spec:
  tls:
  - hosts:
    - example.io
    secretName: home-example-io-tls
  rules:
  - host: example.io
    http:
      paths:
      - backend:
          serviceName: nginx
          servicePort: 80
        path: /
Apply changes:

kubectl apply -f home-ingress-ssl.yaml
Validate changes:

NOTE: Give it sometime as it may take 2-5 mins to get the cert request to complete.

kubectl describe certificate
Your output should look something like below to get valid certificate.

Spec:
  Dns Names:
    example.io
  Issuer Ref:
    Group:      cert-manager.io
    Kind:       Issuer
    Name:       letsencrypt-prod
  Secret Name:  home-example-io-tls
Status:
  Conditions:
    Last Transition Time:  2020-10-26T20:43:35Z
    Message:               Certificate is up to date and has not expired
    Reason:                Ready
    Status:                True
    Type:                  Ready
  Not After:               2021-01-24T19:43:25Z
  Not Before:              2020-10-26T19:43:25Z
  Renewal Time:            2020-12-25T19:43:25Z
  Revision:                2
Events:
  Type    Reason     Age                From          Message
  ----    ------     ----               ----          -------
  Normal  Issuing    24m                cert-manager  Issuing certificate as Secret does not exist
  Normal  Generated  24m                cert-manager  Stored new private key in temporary Secret resource "home-example-io-tls-76dqg"
  Normal  Requested  24m                cert-manager  Created new CertificateRequest resource "home-example-io-tls-h98zf"
  Normal  Issuing    105s               cert-manager  Issuing certificate as Secret was previously issued by Issuer.cert-manager.io/letsencrypt-staging
  Normal  Reused     103s               cert-manager  Reusing private key stored in existing Secret resource "home-example-io-tls"
  Normal  Requested  100s               cert-manager  Created new CertificateRequest resource "home-example-io-tls-ccxgf"
  Normal  Issuing    30s (x2 over 23m)  cert-manager  The certificate has been successfully issued

 
Browse your application and check for valid certificate. If it looks something like below, that means you have successfully requested valid certificate from letsencrypt certificate authority.

