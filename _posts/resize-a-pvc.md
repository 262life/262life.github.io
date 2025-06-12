---
layout: single
author_profile: true
title:  "Rook-Ceph Resize a pvc when Authresize did not work"

summary: "When using rook-ceph, the default for the storage-class is autoresize=no.  Even after you enable it, existing PVC will not auto-resize.  Using this procedure, you can remedy that."
read_time: true
comments: true
share: false
related: false
collection: examples
---

Resize a PVC - 
## Use this if autoresize does NOT work
* First we need the hostname that the PVC is running on.  You get that as follows:
```
[B:avengers:grafana] liottar:/Users/liottar$ kgp -owide
	NAME                       READY   STATUS    RESTARTS   AGE   IP             	NODE   NOMINATED NODE   READINESS GATES
	grafana-58ff767cd6-rlckq   1/1     Running   0          11m   10.233.76.199   *thor*  <none>           <none>
```
* Save the host is it running on.  In this case *thor*
* Next, we need the pv name
```
[B:avengers:grafana] liottar:/Users/liottar$ k get pvc
NAME                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS      AGE
grafana             Bound    *pvc-6089741d-6ec8-40c6-b127-f5df3c3f9bcf*   16Gi       RWO            rook-ceph-block   32m
grafana-certs-pvc   Bound    grafana-certs-pv                           1Gi        ROX            manual            32m
```	
* Save the PV name.  In this case  *pvc-6089741d-6ec8-40c6-b127-f5df3c3f9bcf*
* Now we need the rdb volume
```
k describe pv pvc-6089741d-6ec8-40c6-b127-f5df3c3f9bcf
Name:            pvc-6089741d-6ec8-40c6-b127-f5df3c3f9bcf
Labels:          <none>
Annotations:     pv.kubernetes.io/bound-by-controller: yes
                 pv.kubernetes.io/provisioned-by: rook-ceph.rbd.csi.ceph.com
Finalizers:      [kubernetes.io/pv-protection]
StorageClass:    rook-ceph-block
Status:          Bound
Claim:           grafana/grafana
Reclaim Policy:  Retain
Access Modes:    RWO
VolumeMode:      Filesystem
Capacity:        16Gi
Node Affinity:   <none>
Message:
Source:
    Type:              CSI (a Container Storage Interface (CSI) volume source)
    Driver:            rook-ceph.rbd.csi.ceph.com
    FSType:            ext4
    VolumeHandle:      0001-0009-rook-ceph-0000000000000002-982bc493-c57c-11eb-b70e-be16494d8857
    ReadOnly:          false
    VolumeAttributes:      clusterID=rook-ceph
                           csi.storage.k8s.io/pv/name=pvc-6089741d-6ec8-40c6-b127-f5df3c3f9bcf
                           csi.storage.k8s.io/pvc/name=grafana
                           csi.storage.k8s.io/pvc/namespace=grafana
                           imageFeatures=layering
                           imageFormat=2
                           imageName=*csi-vol-982bc493-c57c-11eb-b70e-be16494d8857*
                           journalPool=replicapool
                           pool=replicapool
                           storage.kubernetes.io/csiProvisionerIdentity=1622684567259-8081-rook-ceph.rbd.csi.ceph.com
Events:                <none>
```
	* Save the rbd image name, in this case   *csi-vol-982bc493-c57c-11eb-b70e-be16494d8857*
* Now go into rook-ceph-tools 
```
k exec -itn rook-ceph rook-ceph-tools-7865b9c9f6-m75sq /bin/bash
```
* Resize the volume
```
 rbd resize --pool replicapool --image csi-vol-982bc493-c57c-11eb-b70e-be16494d8857 --size=18Gi
exit
```
* Now….  Log into the host where the pvc is mounted, in this case Thor and execute the following commands:
```
ssh centos@thor
sudo -I  # You are now root - Beware and two pairs of eyes
df -k | grep pvc-6089741d-6ec8-40c6-b127-f5df3c3f9bcf ### <— PV  from earlier
/dev/rbd4                                                                                                                                               16448380    90116  16341880   1% /var/lib/kubelet/pods/a1183a36-df40-40ed-9188-68217dc87c81/volumes/kubernetes.io~csi/pvc-6089741d-6ec8-40c6-b127-f5df3c3f9bcf/mount
```
	* Note the device name…. In this example /dev/rbd4
```resize2fs /dev/rbd4
exit
exit
```
* k edit pv pvc-6089741d-6ec8-40c6-b127-f5df3c3f9bcf
	* Check the size of the device to make sure it matches what you put in the resize in ceps-tools
* Let’s check it
```
[B:avengers:grafana] liottar:/Users/liottar$ k exec -it grafana-58ff767cd6-mxzbx /bin/bash
kubectl exec [POD] [COMMAND] is DEPRECATED and will be removed in a future version. Use kubectl exec [POD] -- [COMMAND] instead.
bash-5.0$ df -k
Filesystem           1K-blocks      Used Available Use% Mounted on
overlay              251849584  81204868 157828332  34% /
tmpfs                    65536         0     65536   0% /dev
tmpfs                131897456         0 131897456   0% /sys/fs/cgroup
/dev/sda7            1048309768    208876 994826524   0% /etc/pki
/dev/sda5            201453840   2749648 188447808   1% /dev/termination-log
shm                      65536         0     65536   0% /dev/shm
/dev/sda4            251849584  81204868 157828332  34% /etc/resolv.conf
/dev/sda4            251849584  81204868 157828332  34% /etc/hostname
/dev/sda5            201453840   2749648 188447808   1% /etc/hosts
*/dev/rbd4             18512592     90072  18406136   0% /var/lib/grafana*
/dev/sda5            201453840   2749648 188447808   1% /etc/grafana/grafana.ini
tmpfs                131897456        12 131897444   0% /run/secrets/kubernetes.io/serviceaccount
tmpfs                131897456         0 131897456   0% /proc/acpi
tmpfs                    65536         0     65536   0% /proc/kcore
tmpfs                    65536         0     65536   0% /proc/keys
tmpfs                    65536         0     65536   0% /proc/timer_list
tmpfs                    65536         0     65536   0% /proc/sched_debug
tmpfs                131897456         0 131897456   0% /proc/scsi
tmpfs                131897456         0 131897456   0% /sys/firmware
```

