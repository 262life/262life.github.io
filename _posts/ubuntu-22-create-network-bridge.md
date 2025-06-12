---
layout: single
author_profile: true
title:  "Create Network Bridge for multipass on Ubuntu"
summary: "Create network bridge...."
read_time: true
comments: true
share: false
related: false
collection: examples


---

A network bridge is nothing but a device that joins two local networks into one network. It works at the data link layer (layer 2 of the OSI model). Network bridges often used with virtualization software. For example, popular software such as KVM, LXD, or Docker users can configure bridges instead of NAT-based networking. The nmcli command-line tool can create a persistent bridge configuration without editing any files. This page shows how to create a bridge interface using the Network Manager command-line tool called nmcli on an Ubuntu 20.04 LTS Linux server.
Tutorial requirements
Requirements	Ubuntu 18.04/20.04 LTS server
Root privileges 	Yes
Difficulty level 	Easy
Est. reading time 	5 minutes

Table of contents ↓

    1 Adding network bridge
    2 Prerequisite
    3 Creating a Linux network bridge
    4 Disable or enable STP
    5 Set up static or DHCP based IP address
    6 Enable br0 network bridge interface
    7 Verification network bridge
    8 Conclusion

Advertisement
Ubuntu 20.04 add network bridge (br0) with nmcli

The procedure to create and add a bridge interface on Ubuntu version 20.04 is as follows when you want to use Network Manager:

    Open the Terminal app or log in using the ssh command
    Find out information about the current Ubuntu network connection:
    sudo nmcli con show
    Then, add a new bridge called br0:
    sudo nmcli con add ifname br0 type bridge con-name br0
    Create a slave interface for br0 using enp0s31f6 NIC:
    sudo nmcli con add type bridge-slave ifname enp0s31f6 master br0
    Turn on br0 interface to get an IP via DHCP:
    sudo nmcli con up br0
    Static IP settings are discussed below for the br0 interface

Let us see all examples and instructions in detail to create a network bridge in Ubuntu Linux version 20.04 LTS server.
Prerequisite for creating a Linux network bridge on Ubuntu 20.04

First thing, obtain information about the current Ubuntu Linux interface and IP address as we need this information later. Hence, type the following commands:
$ nmcli con show
$ nmcli connection show --active

Outputs:

NAME  UUID                                  TYPE      DEVICE 
ETH0  71a189f2-9cb9-49f0-8464-37a6801740e3  ethernet  enp0s31f6  

So my server has an “ETH0” which uses the enp0s31f6 Ethernet interface. I am going to set up a bridge interface named br0 and add (enslave) an interface to enp0s31f6.
Step 1 – Creating a network bridge named br0

The syntax is:
$ 

$ sudo nmcli con add type bridge-slave ifname enp0s31f6 master br0
$ nmcli connection show

Ubuntu 20.04 add network bridge (br0) with nmcli command
Step 2 – Disable or enable STP for network bridge

The primary purpose of Spanning Tree Protocol (STP) is to ensure that you do not create loops when you have redundant paths in your network. We can disable STP or enable as follows for br0:
$ sudo nmcli con modify br0 bridge.stp no
## Ubuntu 20.04 Linux nmcli command to enable STP with br0 ##
$ sudo nmcli con modify br0 bridge.stp yes
## Verification ##
$ nmcli con show
$ nmcli -f bridge con show br0

Outputs:

bridge.mac-address:                     --
bridge.stp:                             yes
bridge.priority:                        32768
bridge.forward-delay:                   15
bridge.hello-time:                      2
bridge.max-age:                         20
bridge.ageing-time:                     300
bridge.group-forward-mask:              0
bridge.multicast-snooping:              yes
bridge.vlan-filtering:                  no
bridge.vlan-default-pvid:               1
bridge.vlans:                           --

Step 3 – Set up static or DHCP based IP for network bridge interface

We have not allocated any static IP address to our br0 interface. Hence, if the DHCP server is available, it should provide IP addresses and other settings. For instance, we can grab IP settings using DHCP as follows:
$ sudo nmcli con up br0
$ ip a s br0
$ ping www.cyberciti.biz

However, on servers, we typically set up a static IP address. In this example, I am converting existing enp0s31f6 IP network settings to br0 settings as follows:
IPv4 br0 settings

$ sudo nmcli connection modify br0 ipv4.addresses '192.168.2.25/24'
$ sudo nmcli connection modify br0 ipv4.gateway '192.168.2.254'
$ sudo nmcli connection modify br0 ipv4.dns '192.168.2.254'
$ sudo nmcli connection modify br0 ipv4.dns-search 'sweet.home'
$ sudo nmcli connection modify br0 ipv4.method manual
IPv6 br0 settings

$ sudo nmcli connection modify bridge0 ipv6.addresses 'Your-Static-IPv6-Address'
$ sudo nmcli connection modify br0 ipv6.gateway 'Your-Static-IPv6-Gateway-Address'
$ sudo nmcli connection modify br0 ipv6.dns 'Your-Static-IPv6-DNS'
$ sudo nmcli connection modify br0 ipv6.dns-search 'sweet.home'
$ sudo nmcli connection modify br0 ipv6.method manual
Step 4 – Enable br0 network bridge interface on Ubuntu Linux

So far, we configured required network settings. It is time to turn it on our br0:
$ sudo nmcli con up br0
$ nmcli con show

Wait for some time to activate settings.
Step 5 – Verification network bridge settings

Use the ip command to view the IP settings for br0 bridge on Ubuntu box:
$ ip a s
$ ip a s br0

You can remove enp0s31f6 as br0 got a static IP address itself as enp0s31f6 will be in forwarding state:
$ sudo nmcli connection delete enp0s31f6
## or ##
$ sudo nmcli connection delete ETH0

Here is how it looks using the ip command:
$ nmcli connection show
$ ip a show br0
$ nmcli device
## interface active and works with br0 ##
$ ip a show enp0s31f6
$ ip r
## Check Internet and local LAN connectivity using ping command ##
$ ping -c 4 www.cyberciti.biz
$ ping -c 4 192.168.2.25

Show the link status of Ethernet devices and bridge devices on Ubuntu Linux machine:
$ ip link show master br0
$ bridge link show
$ bridge link show dev enp0s31f6

Verify and Create a Network Bridge in Ubuntu 20.04 Linux LTS server
Conclusion

In this tutorial, you learned how to add and create a Linux Network Bridge on Ubuntu 20.04 LTS server. See nmcli docs online for more info.
This entry is 8 of 11 in the Linux and Unix Network Bridging Tutorial series. Keep reading the rest of the series:

    Debian Linux: Configure Network Interfaces As A Bridge / Network Switch
    OpenBSD: Configure Network Interface As A Bridge / Network Switch
    How To PFSense Configure Network Interface As A Bridge / Network Switch
    FreeBSD: NIC Bonding / Link Aggregation / Trunking / Link Failover
    How To Setup Bridge (br0) Network on Ubuntu Linux 14.04 and 16.04 LTS
    Ubuntu setup a bonding device and enslave eth0+eth2
    Setup Bonded (bond0) and Bridged (br0) Networking On Ubuntu
    Ubuntu 20.04 add network bridge (br0) with nmcli command
    CentOS 8 add network bridge (br0) with nmcli command
    How to add network bridge with nmcli (NetworkManager) on Linux
    Set up and configure network bridge on Debian Linux

About the author: Vivek Gite is the founder of nixCraft, the oldest running blog about Linux and open source. He wrote more than 7k+ posts and helped numerous readers to master IT topics. Join the nixCraft community via RSS Feed, Email Newsletter or follow on Twitter.

梁 Was this helpful? Please add a comment to show your appreciation or feedback ↓

Related Tutorials

    CentOS 8 add network bridge (br0) with nmcli command
    CentOS 8 add network bridge (br0) with nmcli command
    How to add network bridge with nmcli (NetworkManager) on…
    How to add network bridge with nmcli (NetworkManager) on…
    How To Setup Bridge (br0) Network on Ubuntu Linux 14.04 and…
    How To Setup Bridge (br0) Network on Ubuntu Linux 14.04 and…
    OpenBSD: Configure Network Interface As A Bridge / Network…
    OpenBSD: Configure Network Interface As A Bridge / Network…
    Debian Linux: Configure Network Interfaces As A Bridge /…
    Debian Linux: Configure Network Interfaces As A Bridge /…
    How To PFSense Configure Network Interface As A Bridge /…
    How To PFSense Configure Network Interface As A Bridge /…
    How To Setup Bonded (bond0) and Bridged (br0) Networking On…
    How To Setup Bonded (bond0) and Bridged (br0) Networking On…

Category 	List of Unix and Linux commands
Ansible	Check version • Fedora • FreeBSD • Linux • Ubuntu 18.04 • Ubuntu • macOS
Backup Management	Debian/Ubuntu • FreeBSD • RHEL
Database Server	Backup MySQL server • MariaDB Galera cluster • MariaDB TLS/SSL • MariaDB replication • MySQL Server • MySQL remote access
Download managers	wget
Driver Management	Linux Nvidia driver • lsmod
Documentation	help • mandb • man • pinfo
Disk Management	df • duf • ncdu • pydf
File Management	cat • cp • less • mkdir • more • tree
Firewall	Alpine Awall • CentOS 8 • OpenSUSE • RHEL 8 • Ubuntu 16.04 • Ubuntu 18.04 • Ubuntu 20.04 • Ubuntu 24.04
KVM Virtualization	CentOS/RHEL 7 • CentOS/RHEL 8 • Debian 9/10/11 • Ubuntu 20.04
Linux Desktop apps	Chrome • Chromium • GIMP • Skype • Spotify • VLC 3
Modern utilities	bat • exa
Network Management	Monitoring tools • Network services • RHEL static IP • Restart network interface • nmcli
Network Utilities	NetHogs • dig • host • ip • nmap • ping
OpenVPN	CentOS 7 • CentOS 8 • Debian 10 • Debian 11 • Debian 8/9 • Ubuntu 18.04 • Ubuntu 20.04
Power Management	upower
Package Manager	apk • apt-get • apt • yum
Processes Management	bg • chroot • cron • disown • fg • glances • gtop • iotop • jobs • killall • kill • pidof • pstree • pwdx • time • vtop
Searching	ag • egrep • grep • whereis • which
Shell builtins	compgen • echo • printf
System Management	reboot • shutdown
Terminal/ssh	sshpass • tty
Text processing	cut • rev
Text Editor	6 Text editors • Save and exit vim
User Environment	exit • who
User Information	groups • id • lastcomm • last • lid/libuser-lid • logname • members • users • whoami • w
User Management	/etc/group • /etc/passwd • /etc/shadow • chsh
Web Server	Apache • Let's Encrypt certificate • Lighttpd • Nginx Security • Nginx
WireGuard VPN	Alpine • Amazon Linux • CentOS 8 • Debian 10 • Firewall • Ubuntu 20.04 • qrencode
8 comments… add one

    unixpro Aug 10, 2020 @ 0:33
    
    I think there’s a limitation with the standard Linux bridge when working with wireless adapters. Actually I think it’s a limitation with wireless link layer then authentication and trying to bridge Ethernet layer 2 over that authenticated stack if you get me.
    Reply Link
    perli Aug 31, 2020 @ 15:00
    
    Hi, i have trouble withe getting an ip from the DHCP server to the bridge while the vm does get an ip. i would appreciate if you explain how to activate the br to work with dhcp , not based on if my dhcp server works in general (I’m on wireless). Thanks
    Reply Link
    PavelN Oct 6, 2020 @ 12:25
    
    BTW: you have a typo in commands (missing con-name option) :
    > Then, add a new bridge called br0:
    sudo nmcli con add type bridge ifname br0
    
    later in the page there is a proper syntax including “con-name” :
    sudo nmcli con add ifname br0 type bridge con-name br0
    Reply Link
         Vivek Gite Oct 26, 2020 @ 12:59
    
        Fixed it. Thanks for the tip and I appreciate your feedback.
        Reply Link
    InnocentBystander Jan 26, 2021 @ 4:35
    
    What is exactly ‘sweet.home’ in
    sudo nmcli connection modify br0 ipv4.dns-search 'sweet.home'
    
    Where does this value come from and what is the purpose/usage of this setting?
    
    Thanks
    Reply Link
         Vivek Gite Jan 27, 2021 @ 19:36
    
        That is my own domain search name set up in my DHCPD. So instead of typing ssh ‘mylaptop.sweet.home’, I type ‘mylaptop’. You can ignore sudo nmcli connection modify br0 ipv4.dns-search ‘sweet.home’ if you don’t have such fancy config.
        Reply Link
    Beau G Apr 8, 2021 @ 13:21
    
    Hello, I am getting the following error:
    
    sudo nmcli con up br0
    Error: Connection activation failed: Connection 'br0' is not available on device br0 because device is strictly unmanaged
    
    nmcli con show
    NAME                 UUID                                  TYPE      DEVICE
    br0                  61d76e77-f193-4aea-94b2-02128aa5e8f1  bridge    --
    bridge-slave-enp3s0  810348e4-c676-42d1-80c1-0414ce956130  ethernet  --
    
    I restarted network manager. Nothing gives.
    Reply Link
        Gautham Apr 8, 2021 @ 15:09
    
        Look like br0 is in managed state.
    
        sudo nmcli dev set {interface} managed {option}
    
        Your {interface} name such as eth0/enp3s0/br0. And {option} can be false, no, off, on, true, and yes. Try something as follows:
    
        sudo nmcli dev set br0 managed yes
    
        Reply Link

Leave a Reply

Your email address will not be published. Required fields are marked *

Comment *

Name

Email

Website

Use HTML <pre>...</pre> for code samples. Your comment will appear only after approval by the site admin.

Next FAQ: How to install KVM on Ubuntu 20.04 LTS Headless Server

Previous FAQ: Squid test config file for syntax errors
     
Search

FEATURED ARTICLES

    1
    30 Cool Open Source Software I Discovered in 2013
    2
    30 Handy Bash Shell Aliases For Linux / Unix / Mac OS X
    3
    Top 32 Nmap Command Examples For Linux Sys/Network Admins
    4
    25 PHP Security Best Practices For Linux Sys Admins
    5
    30 Linux System Monitoring Tools Every SysAdmin Should Know
    6
    40 Linux Server Hardening Security Tips
    7
    Linux: 25 Iptables Netfilter Firewall Examples For New SysAdmins
    8
    Top 20 OpenSSH Server Best Security Practices
    9
    Top 25 Nginx Web Server Best Security Practices
    10
    My 10 UNIX Command Line Mistakes

Sign up for my newsletter
Sign up for my newsletter

    ➔
    Linux shell scripting tutorial
    ➔
    RSS/Feed
    ➔
    About nixCraft

     
©2002-2022 nixCraft • Privacy • ToS • Contact/Email • Corporate patron Linode & Cloudflare

Original: https://www.cyberciti.biz/faq/ubuntu-20-04-add-network-bridge-br0-with-nmcli-command/

