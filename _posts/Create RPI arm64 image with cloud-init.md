# Create RPI arm64 image with cloud-init.

* Download the image

```bash
export IMG="ubuntu-22.04.1-preinstalled-server-arm64+raspi.img"
export URL="https://cdimage.ubuntu.com/releases/22.04/release/$IMG.xz"
wget $URL
xz  --threads=0 --decompress $IMG.xz
DEV=$(sudo partx -v -a $IMG | tail -1 | grep added | awk -F: '{print $1}')
echo DEVICE=$DEV

```

* Plug in the device and then:

```bash



```

* Creat the base image

```bash
# Unmount The disk in case it's mounted.  You can get an error if NOT mounted
mkdir boot 2>/dev/null
sudo umount boot 
sudo mount ${DEV}p1 `pwd`/boot
rm -f lab lab.pub 2>/dev/null 
ssh-keygen -f lab -t ed25519 -N "" -C lab
cat user-data.tpl | sed -e "s/%%SSH-KEY%%/$(cat lab.pub)/g" | sudo /bin/bash -c "cat > ./boot/user-data"


sudo umount boot 
sudo losetup -d $DEV
xz  --threads=0 $IMG
#Plug in device
sudo dmesg -T --since -15m | grep sd | awk '{print $8}' # Should display the device for USB
USB=/dev/sdb
xz  --threads=0 -d < $IMG.xz - | sudo dd bs=100M of=$USB

```

* If all goes according to plan, the system-boot will mount on the desktop
* This is the user-data file we will use.  Please add YOUR ssh-key

```bash
#cloud-config

ssh_pwauth: false

# Create my user & SSH keys
users:
  - default
  - name: ubuntu
    sudo: ALL=(ALL) NOPASSWD:ALL
    ssh_authorized_keys:
      - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCcFducWcJW4kh7E20FXSTG13OXK/NoxtSC1FdBy3etWDmkbZmTC+S2JkZ4f1ivCK08bXA7B6nue83Bk5iryXeNsoQn+UpIb4y9DOzFU9IaEtz09IvfM70fzrn4Lob6jrLHd/qTU3kW55RPCpvA3M3PlyynpXlAFKst3vKWKgR6bXpN/zk11CIZfZALKP4zz7x785f0oeVfta6iTPoSxVokTTh4wohBkuHWNjW7ihzA4Uvv40y+NsROwhjOBv/ZSxQ4jz8irFp8bXDE8dt0NAGZotpMzBjXRF4ggP6hvbEZRy76ehimAdgJQKzDHukHUsqxpuaejch4DlAtVxRZu375 liottar@mbp.logistics.corp"
growpart:
  mode: off
runcmd:
 - while [ true ]; do hostname -I >/dev/null && { printf "IP - "; hostname -I; break; }  || { printf "Waiting for IP Address...\n";sleep 1; }; done
 - printf "ubuntu-host-$(openssl rand -hex 3)" > /etc/hostname
 - printf "Ubuntu 22.04 LTS \nIP - $(hostname -I)\n" > /etc/issue
 - df -k 2>&1 >> /etc/issue
 - echo "" >> /etc/issue
```



```
#Boot

parted -a optimal ---pretend-input-tty <<EOD
resizepart
2
Yes
70G
quit
EOD
resize2fs /dev/sda2


sudo snap install microk8s --classic
sudo snap install nmap
   ufw allow in on cni0 && sudo ufw allow out on cni0
   ufw default allow routed
   sudo usermod -a -G microk8s ubuntu
   sudo mkdir ~/.kube
   sudo chown -R ubuntu ~/.kube
   newgrp microk8s
   microk8s start
   microk8s status  
   
   microk8s enable dns hostpath-storage ingress

# Assumption is this is the master node...
PASS="$(uuidgen)" 


DEV=$(ip -o -f inet route |grep -e "^default" |awk '{print $5}')
ME24=$(echo $(ip -o -f inet addr show | grep "$DEV" | awk '/scope global/ {print $4}'))
SN=$(echo $ME24 | awk -F'[./]' '{print $1 "." $2 "." $3 ".0/" $5}')
ME=$(echo $ME24 | awk -F'[./]' '{print $1 "." $2 "." $3 "." $4}')
rm -rf logs 2>/dev/null; mkdir logs
nmap -n -T4 -Pn -p16443 --max-rtt-timeout 200ms --initial-rtt-timeout 150ms --min-hostgroup 512 -oG logs/pb-port16443scan2-%D.gnmap $SN

touch DB
if [[ $(microk8s kubectl get cm homelab 2>/dev/null )  ]]; then microk8s kubectl get cm homelab  -o jsonpath='{.data.DB}' > ./DB; fi
# Create DB
# Myself 1st CP
echo $(egrep '[^0-9]16443/open' logs/pb-port16443scan2-*.gnmap | awk -F'[ ()]' '{print $2 " " $4 }' | grep $(hostname -s)) master | grep -vf ./DB >> DB && echo Added Master 
# 1st Control Plane
echo $(egrep '[^0-9]16443/open' logs/pb-port16443scan2-*.gnmap | awk -F'[ ()]' '{print $2 " " $4 }' | grep -v $(hostname -s)| head -1) cp | grep -vf ./DB >> DB && echo Added a Control Plane
# workers
egrep '[^0-9]16443/open' logs/pb-port16443scan2-*.gnmap | awk -F'[ ()]' '{print $2 " " $4 }' |
while read h
do
  H=$(echo $h | awk '{print $1}')
  grep "$H" ./DB > /dev/null
  if [ $? != 0 ];then
    echo $h worker >> ./DB && echo "Added worker $H"
  fi
done
if [ -f ./DB ]; then
  microk8s kubectl delete cm homelab 2>/dev/null
  microk8s kubectl create cm homelab --from-file=./DB
fi

## Need code to READ DB

        do TOKEN=$(echo "$I$PASS" | sha1sum | awk '{ print $1}')
           echo Token: $TOKEN
           microk8s add-node -t $TOKEN           
        done 
        
# Control Plane

Need to add hostname to /etc/hosts for each node on the master
egrep '[^0-9]16443/open' logs/pb-port16443scan2-*.gnmap | awk -F'[ ()]' '{print $2 " " $4 }' | grep -v $(hostname -s) | head -2 |
while read I H
        do TOKEN=$(echo "$I$PASS" | sha1sum | awk '{ print $1}')
           echo Token: $TOKEN
           microk8s add-node -t $TOKEN           
        done 
        
```





```
#cloud-config
runcmd:
 - |
   # change here
   NET=10.0.0 # internal subnet of virtual machines
   PASS="super-secret-password" # a secret password to generate tokens
   # end changes
   IP="$(hostname | sed -e 's/[^0-9]*//')"
   IF="$(ip -o -4 route show to default | awk '{print $5}')"
   OUT="$(ip -o -4 route show to default | awk '{print $9}')"
   # configure static ip - comment this if aassigned automatically
   printf "network:\n version: 2\n renderer: networkd\n ethernets:\n  $IF:\n    addresses:\n     - $NET.$IP/24" | tee /etc/netplan/90-static.yaml
   netplan apply
   # install and start microk8s
   snap install microk8s --classic
   ufw allow in on cni0 && sudo ufw allow out on cni0
   ufw default allow routed
   microk8s start
   microk8s status  
   if test "$IP" = "1"
   then microk8s enable dns storage ingress        
        for I in $(seq 1 9)
        do TOKEN=$(echo "$I$PASS" | sha1sum | awk '{ print $1}')
           microk8s add-node -t $TOKEN           
        done 
        microk8s config | sed -e "s|server: https://$NET.1:16443|server: https://$OUT:16443|" >/etc/kubeconfig
   else 
        TOKEN="$(echo "$IP$PASS" | sha1sum | awk '{ print $1}')"        
        while ! microk8s join "$NET.1:25000/$TOKEN"
        do echo retrying to join... ; sleep 10
        done
   fi
apt_update: true
```

## Multipass

Had to add this....

https://gist.github.com/ynott/f4bdc89b940522f2a0e4b32790ddb731

sudo multipass launch  --network br0  --name test1 --cloud-init=./multipass-user-data -c 2 -m 8Gib -d 30GiB



ip a sh enp6s0 | grep -Eo 'inet [0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | cut -d' ' -f2



Need to change the default route-mtric to 50 see /etc/netplan