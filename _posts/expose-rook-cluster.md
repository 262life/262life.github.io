---
layout: single
author_profile: true
title:  "Expose Rook Cluster Outside K3s"
summary: "Expose Rook Cluster Outside K3s..."
read_time: true
comments: true
share: false
related: false
collection: examples

---
Expose a Rook-based Ceph cluster outside of Kubernetes
By Leo SCHOUKROUN adaltas.com4 min
View Original
We recently deployed a LXD based Hadoop cluster and we wanted to be able to apply size quotas on some filesystems (ie: service logs, user homes). Quota is a built in feature of the Linux kernel used to set a limit of how much disk space our users can use. For exemple, we have edge nodes used to provide a secured working space to our users. They are accessible through SSH with an already pre-configured Hadoop and Kubernetes client environment and we must ensure a user will not fill the file system with data when he should instead use HDFS for this. CephFS with Rook seemed to be a good fit given the fact that we also have a Kubernetes cluster ready for action in the same infrastructure. Rook has become the standard for distributed storage provisioning in Kubernetes and we make use of it to provision and managed our CepthFS storage layer.

This article will detail how to expose a Rook Ceph cluster for use outside of Kubernetes.

Rook deployment
The first thing we need to do is to install Rook and Ceph in the Kubernetes cluster. We will not go too deep in details here and just follow Rook’s quick start guide. If you encounter issues such as the OSD’s not being created, check out Eyal’s article: ”Rook with Ceph doesn’t provision my Persistent Volume Claims!“.

From here we can mount the Filesystem in a Ceph toolbox pod by following instructions given in the Rook documentation.

First we create the toolbox and run a shell in it:

kubectl create -f toolbox.yaml 
kubectl -n rook-ceph exec -it $(kubectl -n rook-ceph get pod -l "app=rook-ceph-tools" -o jsonpath='{.items[0].metadata.name}') bash
And then mount the filesystem.

mkdir /mounted_dir

mon_endpoints=$(grep mon_host /etc/ceph/ceph.conf | awk '{print $3}')
my_secret=$(grep key /etc/ceph/keyring | awk '{print $3}')

mount -t ceph -o mds_namespace=myfs,name=admin,secret=$my_secret $mon_endpoints:/ /mounted_dir
By default, the cluster is only accessible inside the Kubernetes network. Indeed if we take a look at the mon_endpoints variable:

echo $mon_endpoints 
10.107.4.123:6789,10.102.4.224:6789,10.99.152.180:6789
These IP addresses are internal to the Kubernetes cluster.

If we try to mount the FS using these IPs on a host outside of Kubernetes, it will not work:

mkdir /mounted_dir
mon_endpoints="10.107.4.123:6789,10.102.4.224:6789,10.99.152.180:6789"
my_secret="AQBbQ5BeYf8rOBAAetM2gKeJWeUisAvrbmfQdA=="
mount -t ceph -o mds_namespace=myfs,name=admin,secret=$my_secret $mon_endpoints:/ /mounted_dir

mount: mount 10.107.4.123:6789,10.102.4.224:6789,10.99.152.180:6789:/ on /mounted_dir failed: Connection timed out
Indeed, we can not open a connection to 10.107.4.123:6789:

nc -zv 10.107.4.123 6789
Ncat: Version 7.50 ( https://nmap.org/ncat )
Ncat: Connection timed out.
The Ceph monitor daemons are exposed inside the cluster through the following services:

kubectl get svc -n rook-ceph
NAME                       TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)             AGE
...
rook-ceph-mon-a            ClusterIP   10.102.4.224     <none>        6789/TCP,3300/TCP   132m
rook-ceph-mon-b            ClusterIP   10.99.152.180    <none>        6789/TCP,3300/TCP   132m
rook-ceph-mon-c            ClusterIP   10.107.4.123     <none>        6789/TCP,3300/TCP   132m
Our first idea was to change the type of service from ClusterIP to NodePort:

kubectl get svc -n rook-ceph
NAME                       TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                         AGE
...
rook-ceph-mon-a            NodePort    10.102.4.224     <none>        6789:30243/TCP,3300:30022/TCP   136m
rook-ceph-mon-b            NodePort    10.99.152.180    <none>        6789:30637/TCP,3300:30027/TCP   136m
rook-ceph-mon-c            NodePort    10.107.4.123     <none>        6789:31302/TCP,3300:30658/TCP   135m
With this, we could reach the Monitors with the actual Kubernetes’ nodes IPs:

nc -zv 10.0.0.70 30243
Ncat: Version 7.50 ( https://nmap.org/ncat )
Ncat: Connected to 10.0.0.70:30243.
Ncat: 0 bytes sent, 0 bytes received in 0.02 seconds
But when we tried to mount the FS again:

mkdir /mounted_dir
mon_endpoints="10.0.0.72:30243,10.0.0.72:30637,10.0.0.72:31302"
my_secret="AQBbQ5BeYf8rOBAAetM2gKeJWeUisAvrbmfQdA=="
mount -t ceph -o mds_namespace=myfs,name=admin,secret=$my_secret $mon_endpoints:/ /mounted_dir

mount: mount 10.0.0.72:30243,10.0.0.72:30637,10.0.0.72:31302:/ on /mounted_dir failed: Connection timed out
Unfortunately it did not work. While the machine was able to contact the Ceph clusters’ monitors, they responded with their Kubernetes internal IPs. This could be seen in the kernel messages of the host after the mount timed out:

dmesg | grep ceph
[786368.713136] libceph: mon1 (1)10.0.0.72:30637 wrong peer at address
[786370.153821] libceph: wrong peer, want (1)10.0.0.72:30243/0, got (1)10.102.4.224:6789/0
[786370.153825] libceph: mon0 (1)10.0.0.72:30243 wrong peer at address
[786370.729937] libceph: wrong peer, want (1)10.0.0.72:30243/0, got (1)10.102.4.224:6789/0
[786373.225787] libceph: mon2 (1)10.0.0.72:31302 wrong peer at address
[786373.769784] libceph: wrong peer, want (1)10.0.0.72:31302/0, got (1)10.107.4.123:6789/0
After some research in the GitHub issues of Rook, we discovered this issue implemented by this pull request.

The Rook Ceph cluster property hostNetwork can be set to true to use the network of the hosts instead of using the Kubernetes network.

After adding the following property in cluster.yaml and recreating the cluster:

network:
  hostNetwork: true
This time, there are no Services created to expose the Ceph Monitor pods:

kubectl -n rook-ceph get svc 
NAME                       TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)             AGE
csi-cephfsplugin-metrics   ClusterIP   10.96.31.24      <none>        8080/TCP,8081/TCP   10m
csi-rbdplugin-metrics      ClusterIP   10.100.212.142   <none>        8080/TCP,8081/TCP   10m
rook-ceph-mgr              ClusterIP   10.105.255.14    <none>        9283/TCP            7m25s
rook-ceph-mgr-dashboard    ClusterIP   10.98.54.85      <none>        8443/TCP            7m45s
Indeed they can can be reached directly on the port 6789 of the Kubernetes host:

nc -zv 10.0.0.70 6789
Ncat: Version 7.50 ( https://nmap.org/ncat )
Ncat: Connected to 10.0.0.70:6789.
Ncat: 0 bytes sent, 0 bytes received in 0.02 seconds.
Let’s try to mount the filesystem again:

mon_endpoints="10.0.0.72:6789,10.0.0.72:6789,10.0.0.72:6789"
my_secret="AQDfh5BeSlxfDBAALWOd8Atlc9GtLaOs4lGB/A=="
mount -t ceph -o mds_namespace=myfs,name=admin,secret=$my_secret $mon_endpoints:/ /mounted_dir

df -h /mounted_dir/
Filesystem                                      Size  Used Avail Use% Mounted on
10.0.0.72:6789,10.0.0.72:6789,10.0.0.72:6789:/  332G     0  332G   0% /mounted_dir
It works! We are now able to externally mount a CephFS provisionned inside a Kubernetes with Rook.