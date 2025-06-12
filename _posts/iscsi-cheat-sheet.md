---
layout: single
author_profile: true
title:  "ISCSI Cheat Sheet"
summary: "iscsiadm shortcuts..."
read_time: true
comments: true
share: false
related: false
collection: examples
---

As a host trying to access a iSCSI disk (iscsi-initiator) : 

Packages required: 
- iscis-initiator-utils
Discover the targets available on a host : 

  iscsiadm -m discovery -t st -p #IP#


Use/login to the discovered target and host:

   iscsiadm -m node -T #iSCSIdiskName# -p #IP# --login

Logout/Remove the disk from your host: 

  iscsiadm -m node -T #iSCSIdiskName# -p #IP# --logout
Permanently remove the target from your host: 

  iscsiadm -m node -p #IP# -o delete

As a host providing the iSCSI disk (scsi-target) : 
Packages required: 
- scsi-target-utils
Create the file /vmfs/iscsi/iscsi-share.img with : 
  dd if=/dev/zero of=/vmfs/iscsi/iscsi-share.img bs=1M count=12000

  (will create a 12GB disk)
Edit / Create a config file : 
vi /etc/tgt/conf.d/iscsi-share.conf

< target iqn.2013-03.testlab.local:iscsi.lun99 > 
  backing-store /vmfs/iscsi/iscsi-share.img 
  lun 2
< /target >

Note: It's important to increase the LUN number when you use multiple iSCSI target hosts that also use "dd" image files, else the LUN ID will be the same and multipath will take its toll. (e.g. it'll break). If you copy & paste above, please remove the spaces ;)
Restart tgtd 
  service tgtd restart

However, if you changed settings for a existing target, from experience, I've had to restart the entire server to ensure that any cached settings got lost and the new settings used. A force-restart did also not help in that situation.