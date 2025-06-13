---
title:  "Beeline"
summary: "Quick and Easy guide to Beeline shortcuts for kubectl"
header:
excerpt_separator: <!--more-->
---
<img align="left" src="/assets/images/K8-Beeline.png">
# Quick and Easy guide to Beeline shortcuts for kubectl
<!--more-->
I absolutely love open-source and believe 100% that it's the best way to develop software.  In the last few years I dedicated and invested much of my time in Kubernetes and containerization.  I love working with the command line. Seriously I don't think there is a more effective way to interact in a computing environment for development, administration or just outright tinkering.  Don't get me wrong, I have nothing against UI/GUI and they are great in a pinch and a great way to familiarize yourself with an application.  I use kubectl quite extensively and eventually the typing becomes a bit exhausting for repetitive tasks.  There are lot's of extensions available for kubectl but I wanted to create something straight forward and easy to use and even extend if you want to.  It's called Beeline and it is a number of shortcuts and aliases for zsh and bash.  It was designed to use on the command-line, integrated with autocomplete, and also in a bash script that is easy to read and follow for many procedural tasks like installing a helm chart.

This post will give you the same two minute introduction about Beeline and its possibilities, followed by the typical 10 minute hands-on guide to set up and get to know Beeline yourself. If you’ve got 10 minutes to spare and finally want to be more proficient with Beeline: read on! Otherwise, if you already use zsh and already installed [oh-my-zsh](https://ohmyz.sh/), just us the /quick primer/

## TLDR; This is the lazy version. . .
```applescript
#####  Setup Beeline

## Defaults if you like
export KS_CONTEXT='cities'
export KS_NAMESPACE='kube-system'

[[ ! -f ~/.beeline.k8s ]]  \
&& curl -s -L https://github.com/262life/beeline/releases/latest/download/beeline.sh  > ~/.beeline.k8s

source ~/.beeline.k8s
##### End of Beeline
```

That's it.  Type kh to get a list of shortcuts.

## Full Installation

To use the shortcut scripts it is *required* that you have setup either bash or zsh completion in advance.  Beeline will enable kubectl's auto completion on your behalf.

### Installing ZSH 
This has been tested on macOS, Ubuntu, and Windows WSL2.  

I highly recommend changing your login shell to zsh.  It is *now* the <span style="color:lightgreen">*macOS*</span> default.  For Ubuntu or WSL2, the following will install zsh.  If prompted, choose any defaults.

```applescript
sudo apt install zsh
```

and to enable autocomplete for zsh on all of the supported environments, install [oh-my-zsh](https://ohmyz.sh/) as follows:

```applescript
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

To enable these shortcuts you must source them into your shell.  This is dependent on the shell you are using.
You can either download the desired version you would like or if you are lazy like me do something like this if you use zsh:

```applescript
#####  Setup Beeline

## Defaults if you like
export KS_CONTEXT='cities'
export KS_NAMESPACE='kube-system'

[[ ! -f ~/.beeline.k8s ]]  \
&& curl -s -L https://github.com/262life/beeline/releases/latest/download/beeline.sh  > ~/.beeline.k8s

source ~/.beeline.k8s
##### End of Beeline
```
Take note to edit the KS_CONTEXT and KS_NAMESPACE values to your liking.

Restart your shell and you should be good to go!  

Now, review the [usage documentation](https://github.com/262life/beeline/blob/master/DOCUMENTATION.md) 


## Getting started with Beeline

At the heart of Beeline are the two most important and essential shortcuts; *kc* and *kn*.  These control the context of the session you are in.  Wait?  Did I say session?  kubectl sets the contexts in the config file and if multiple windows are open as the same user, it's shared right?  Well with Beeline that is not the case!  You can have multiple windows open or even multiple shells and the context stays with the current shell!  Cool right?

Example: 
```applescript
[B:cities:kube-system] liottar:/Users/liottar$ kc cities rook-ceph
Context "cities" modified.
Property "current-context" set.
[B:cities:kube-system] liottar:/Users/liottar$ kn kube-system

Cluster    : Cities Cluster / Location: St. Augustine FL
Context    : cities
Namespace  : kube-system

Context "cities" modified.
Property "current-context" set.
```

### About the config files

If you have a number of kubernetes clusters to manage like I do, one of the more complicated aspects of kubectl becomes managing the config files.  This file can become long and extremely hard to read even for expert users.

Beeline takes care of this allowing you to keep a separate config file for each cluster like this example:

```yaml
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: LS0tLS1CRUdJTiBDRL35SUZJQ0FURS0tLS0tCk1JSUJlRENDQVIyZ0F3SUJBZ0lCQURBS0JnZ3Foa2pPUFFRREFqQWpNU0V3SHdZRFZRUUREQmhyTTNNdGMyVnkKZG1WeUxXTmhRREUyTWpBMk5UUTBNall3SGhjTk1qRXdOVEV3TVRNME56QTJXaGNOTXpFd05UQTRNVE0wTnpBMgpXakFqTVNFd0h3WURWUVFEREJock0zTXRjMlZ5ZG1WeUxXTmhRREUyTWpBMk5UUTBNall3V1RBVEJnY3Foa2pPClBRSUJCZ2dxaGtqT1BRTUJCd05DQUFSaTJmSDNJY3QzZS9VSUtaS2hFOVRQeVJBYVBnNzRuY1VxQUlCUVI5YmYKMGJNaFpUVVhlWjhnUnRNZVFwY1lqZ1pHWEtXZVV5SW5LZFBmYlZuMU4zazhvMEl3UURBT0JnTlZIUThCQWY4RQpCQU1DQXFRd0R3WURWUjBUQVFIL0JBVXdBd0VCL3pBZEJnTlZIUTRFRmdRVTZkVWdqU1BuQU83OGpqYm9WVlJWCm1BV1BMVjB3Q2dZSUtvWkl6ajBFQXdJRFNRQXdSZ0loQUtMT0Ivd2hpQmJFd2prUE5wQ0VqZTFnYWM4Z3hZS2QKSWdKOFB6QUFzQkJ0QWlFQXU5TWw0R0wxN1ZPNEk3L0FRWmVBUnJQK3JxVlpzR3crMzBWbHVlMGtXakU9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K
    server: https://cluster.internaldomain.com:6443
  name: cities
contexts:
- context:
    cluster: cities
    namespace: 
    user: cities
  name: cities
current-context: cities
kind: Config
preferences: {}
users:
- name: cities
  user:
    client-certificate-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1J3X4rVENDQVRlZ0F3SUJBZ0lJY05rbFVtTUcwL1l3Q2dZSUtvWkl6ajBFQXdJd0l6RWhNQjhHQTFVRUF3d1kKYXpOekxXTnNhV1Z1ZEMxallVQXhOakl3TmpVME5ESTJNQjRYRFRJeE1EVXhNREV6TkRjd05sb1hEVEl5TURVeApNREV6TkRjd05sb3dNREVYTUJVR0ExVUVDaE1PYzNsemRHVnRPbTFoYzNSbGNuTXhGVEFUQmdOVkJBTVRESE41CmMzUmxiVHBoWkcxcGJqQlpNQk1HQnlxR1NNNDlBZ0VHQ0NxR1NNNDlBd0VIQTBJQUJENEJrczQwK00xZjJLUkcKLzdHR2tHZkNVOWdUT2JKeDZxVEdVbG9TSzZha3htcmwzaEdTb2FKbjc1S1F4OWw2cW5aZFJmWmFSazN2NnZEUQpCeXhtU0NLalNEQkdNQTRHQTFVZER3RUIvd1FFQXdJRm9EQVRCZ05WSFNVRUREQUtCZ2dyQmdFRkJRY0RBakFmCkJnTlZIU01FR0RBV2dCVEVzT1pPU2VnMDh6OTNSVFhob1g3SmVwVG9mekFLQmdncWhrak9QUVFEQWdOSUFEQkYKQWlFQXEwVmhyTXpnVk80WDYyWDg1QXBNZ1haa0EwTE11NUFNWitRTlBZaGVLOTRDSUM3N0RpTVlXQXlXZFdkcQoydjZpdGZJeDhqbTl6d0JldXFTTjd3TzJYKzBsCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0KLS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUJkakNDQVIyZ0F3SUJBZ0lCQURBS0JnZ3Foa2pPUFFRREFqQWpNU0V3SHdZRFZRUUREQmhyTTNNdFkyeHAKWlc1MExXTmhRREUyTWpBMk5UUTBNall3SGhjTk1qRXdOVEV3TVRNME56QTJXaGNOTXpFd05UQTRNVE0wTnpBMgpXakFqTVNFd0h3WURWUVFEREJock0zTXRZMnhwWlc1MExXTmhRREUyTWpBMk5UUTBNall3V1RBVEJnY3Foa2pPClBRSUJCZ2dxaGtqT1BRTUJCd05DQUFUMG5oUXIwNWpqa3RrSmVZMXJUUGN3T2poWXpCTk92dnZyT1hLdU9hTmMKSWFyYVMxV1Zibmthb1NJRW40OGNmVmdmUmNlcGw3Y0kvT3ltajA1Y3dYWjNvMEl3UURBT0JnTlZIUThCQWY4RQpCQU1DQXFRd0R3WURWUjBUQVFIL0JBVXdBd0VCL3pBZEJnTlZIUTRFRmdRVXhMRG1Ua25vTlBNL2QwVTE0YUYrCnlYcVU2SDh3Q2dZSUtvWkl6ajBFQXdJRFJ3QXdSQUlnSjBiRlVmUk5tRE15WjUzRFpnRllLWWNLTitlelhOSVcKMVRSTkdDcWZ3NzBDSUVDTitiOTJva0NSYUtGeFlVcE4xYW1NMmoyMjd6NGdaenZYUDNibWR4eEUKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=
    client-key-data: LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0tCk1IY0NBUUVFSU02dS9DaExlZkx0AHNrcGI2ZHMveFQxQlVsdGVzZFB0ZkxXNUFOZEVLSmZvQW9HQ0NxR1NNNDkKQXdFSG9VUURRZ0FFUGdHU3pqVDR6Vi9ZcEViL3NZYVFaOEpUMkJNNXNuSHFwTVpTV2hJcnBxVEdhdVhlRVpLaApvbWZ2a3BESDJYcXFkbDFGOWxwR1RlL3E4TkFITEdaSUlnPT0KLS0tLS1FTkQgRUMgUFJJVkFURSBLRVktLS0tLQo=

```
As you can see, it's easy to read as a single YAML file therefore quote effect.  How do you make use?  Just add one or many of these files one for each cluster in your $HOME/.kube file and give it a .cfg extension and that's all you need to do.  Beeline will take care of the rest.

<span style="color:lightgreen">*Note:  Do NOT remove the config file as it will be used as well.*</span>

## Practical Examples

Set context and namespace
```applescript
[B:cities:kube-system] liottar:/Users/liottar/projects/262life/beeline$ kc cities rook-ceph

Cluster    : Cities Cluster / Location: St. Augustine FL
Context    : cities
Namespace  : rook-ceph

Context "cities" modified.
Property "current-context" set.
Context "cities" modified.
Property "current-context" set.
[B:cities:rook-ceph] liottar:/Users/liottar/projects/262life/beeline$
```

Get context and namespace
```applescript
[B:cities:kube-system] liottar:/Users/liottar$ kc

Cluster    : Cities Cluster / Location: St. Augustine FL
Context    : cities
Namespace  : kube-system

Context "cities" modified.
Property "current-context" set.
```

Get all pods with wide output
```applescript
[B:cities:rook-ceph] liottar:/Users/liottar$ kgp -owide
NAME                                                     READY   STATUS      RESTARTS   AGE   IP              NODE       NOMINATED NODE   READINESS GATES
csi-cephfsplugin-2xt6f                                   3/3     Running     3          55d   192.168.1.241   moscow     <none>           <none>
csi-cephfsplugin-provisioner-78d66674d8-fxkk4            6/6     Running     0          55d   10.42.2.11      florence   <none>           <none>
csi-cephfsplugin-provisioner-78d66674d8-qqvvh            6/6     Running     0          55d   10.42.0.20      miami      <none>           <none>
csi-cephfsplugin-rhsj2                                   3/3     Running     3          55d   192.168.1.243   miami      <none>           <none>
csi-cephfsplugin-sgwmj                                   3/3     Running     3          55d   192.168.1.242   florence   <none>           <none>
csi-rbdplugin-68x8h                                      3/3     Running     3          55d   192.168.1.243   miami      <none>           <none>
csi-rbdplugin-j5sqc                                      3/3     Running     3          55d   192.168.1.242   florence   <none>           <none>
csi-rbdplugin-m5ccj                                      3/3     Running     3          55d   192.168.1.241   moscow     <none>           <none>
csi-rbdplugin-provisioner-687cf777ff-4t8cv               6/6     Running     6          55d   10.42.1.131     moscow     <none>           <none>
csi-rbdplugin-provisioner-687cf777ff-ddvzq               6/6     Running     0          55d   10.42.0.21      miami      <none>           <none>
rook-ceph-csi-detect-version-v9ggr                       0/1     Completed   0          54d   10.42.0.19      miami      <none>           <none>
rook-ceph-mds-rsliotta-fs-a-5db685547d-z6mz2             1/1     Running     332        67d   10.42.1.123     moscow     <none>           <none>
rook-ceph-mds-rsliotta-fs-b-588755bd54-pt75s             1/1     Running     0          55d   10.42.2.15      florence   <none>           <none>
rook-ceph-mgr-a-69f7b69cc-bb4vj                          1/1     Running     275        67d   10.42.1.124     moscow     <none>           <none>
rook-ceph-mon-c-7dbbcc9769-s9gcg                         1/1     Running     0          55d   10.42.0.16      miami      <none>           <none>
rook-ceph-mon-d-66787cb764-lqhm7                         1/1     Running     1          58d   10.42.1.129     moscow     <none>           <none>
rook-ceph-operator-785bf4fff4-6sr42                      1/1     Running     1          55d   10.42.1.130     moscow     <none>           <none>
rook-ceph-osd-0-685bd594cd-6fnx7                         1/1     Running     0          55d   10.42.2.21      florence   <none>           <none>
rook-ceph-osd-1-6d4dd94666-s5jz5                         1/1     Running     0          55d   10.42.2.14      florence   <none>           <none>
rook-ceph-osd-2-677478c46b-djd2p                         1/1     Running     0          55d   10.42.2.13      florence   <none>           <none>
rook-ceph-osd-3-6f8b9c845f-tdt2c                         1/1     Running     0          55d   10.42.2.18      florence   <none>           <none>
rook-ceph-osd-4-565b49d85c-cxtlb                         1/1     Running     0          55d   10.42.2.22      florence   <none>           <none>
rook-ceph-osd-5-65464f9b7d-l7q4j                         1/1     Running     0          55d   10.42.2.12      florence   <none>           <none>
rook-ceph-osd-6-9978758bf-jkdpl                          1/1     Running     0          55d   10.42.2.10      florence   <none>           <none>
rook-ceph-osd-7-58df8bbdc4-jt98j                         1/1     Running     0          55d   10.42.2.20      florence   <none>           <none>
rook-ceph-osd-prepare-florence-25x69                     0/1     Completed   0          53d   10.42.2.25      florence   <none>           <none>
rook-ceph-osd-prepare-miami-n6s6z                        0/1     Completed   0          53d   10.42.0.28      miami      <none>           <none>
rook-ceph-osd-prepare-moscow-kbcwz                       0/1     Completed   0          53d   10.42.1.137     moscow     <none>           <none>
rook-ceph-rgw-rsliotta-object-store-a-799f6644d4-7ffkk   1/1     Running     340        67d   10.42.1.118     moscow     <none>           <none>
rook-ceph-tools-6bc7c4f9fc-tx96t                         1/1     Running     1          67d   10.42.1.120     moscow     <none>           <none>
```

Get all pods with wide output but only names with osd in them
```applescript
[B:cities:rook-ceph] liottar:/Users/liottar$ kf pod 'osd'
NAME                                                     READY   STATUS      RESTARTS   AGE
rook-ceph-osd-0-685bd594cd-6fnx7                         1/1     Running     0          55d
rook-ceph-osd-1-6d4dd94666-s5jz5                         1/1     Running     0          55d
rook-ceph-osd-2-677478c46b-djd2p                         1/1     Running     0          55d
rook-ceph-osd-3-6f8b9c845f-tdt2c                         1/1     Running     0          55d
rook-ceph-osd-4-565b49d85c-cxtlb                         1/1     Running     0          55d
rook-ceph-osd-5-65464f9b7d-l7q4j                         1/1     Running     0          55d
rook-ceph-osd-6-9978758bf-jkdpl                          1/1     Running     0          55d
rook-ceph-osd-7-58df8bbdc4-jt98j                         1/1     Running     0          55d
rook-ceph-osd-prepare-florence-25x69                     0/1     Completed   0          53d
rook-ceph-osd-prepare-miami-n6s6z                        0/1     Completed   0          53d
rook-ceph-osd-prepare-moscow-kbcwz                       0/1     Completed   0          53d
```

or the same with a wide output by creating a list with the *kfl* utility function to pass to *kgp*
```applescript
[B:cities:rook-ceph] liottar:/Users/liottar$ kgp -owide $(kfl pod 'osd')
NAME                                   READY   STATUS      RESTARTS   AGE   IP            NODE       NOMINATED NODE   READINESS GATES
rook-ceph-osd-0-685bd594cd-6fnx7       1/1     Running     0          55d   10.42.2.21    florence   <none>           <none>
rook-ceph-osd-1-6d4dd94666-s5jz5       1/1     Running     0          55d   10.42.2.14    florence   <none>           <none>
rook-ceph-osd-2-677478c46b-djd2p       1/1     Running     0          55d   10.42.2.13    florence   <none>           <none>
rook-ceph-osd-3-6f8b9c845f-tdt2c       1/1     Running     0          55d   10.42.2.18    florence   <none>           <none>
rook-ceph-osd-4-565b49d85c-cxtlb       1/1     Running     0          55d   10.42.2.22    florence   <none>           <none>
rook-ceph-osd-5-65464f9b7d-l7q4j       1/1     Running     0          55d   10.42.2.12    florence   <none>           <none>
rook-ceph-osd-6-9978758bf-jkdpl        1/1     Running     0          55d   10.42.2.10    florence   <none>           <none>
rook-ceph-osd-7-58df8bbdc4-jt98j       1/1     Running     0          55d   10.42.2.20    florence   <none>           <none>
rook-ceph-osd-prepare-florence-25x69   0/1     Completed   0          53d   10.42.2.25    florence   <none>           <none>
rook-ceph-osd-prepare-miami-n6s6z      0/1     Completed   0          53d   10.42.0.28    miami      <none>           <none>
rook-ceph-osd-prepare-moscow-kbcwz     0/1     Completed   0          53d   10.42.1.137   moscow     <none>           <none>
```
As you see, you can combine the commands to make more shortcuts for yourself!

In summary, I hope this helps you get off to a good start with Beeline!  




