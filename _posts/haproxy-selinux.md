---
layout: single
author_profile: true
title:  "HAProxy on SELinux"
summary: "HAProxy cannot bind socket..."
read_time: true
comments: true
share: false
related: false
xcollection: examples
---



You haven’t highlighted anything yet
When you select text while you’re reading, it'll appear here.


HAProxy cannot bind socket [0.0.0.0:8888]
By Code Man Stack Overflow5 min
View Original
I build a HAProxy on CentOS 7 and enable statistics page with port 8080. It seems work properly. When I set port as 8888, the HAProxy is not working and gives me some feedback.
After that, I tried many ways to solve this problem, but the problem is still there.

Does anyone can help me deal with this issue?

Here is the system information
haprxoy.cfg

/etc/haproxy/haproxy.cfg
Port 8080 is fine, 8888 is not working.

    # [HAPROXY DASHBOARD]
        listen  stats :8888
        mode http
        stats enable
        stats hide-version
        stats realm Haproxy\ Statistics
        stats uri /
        stats auth haproxy:haproxy
        stats refresh 10s
Service Status

service haproxy status

systemd[1]: Started HAProxy Load Balancer.
haproxy-systemd-wrapper[2358]: haproxy-systemd-wrapper: executing /usr/sbin/haproxy -f /etc/haproxy/haproxy.cf...id -Ds
haproxy-systemd-wrapper[2358]: [ALERT] 012/095413 (2359) : Starting proxy stats: cannot bind socket [0.0.0.0:8888]
haproxy-systemd-wrapper[2358]: haproxy-systemd-wrapper: exit, haproxy RC=256
/etc/sysctl.conf
Someone said that could be a Virtual IP problem, so I follow the instruction and add the setting below then run sysctl -p

net.ipv4.ip_nonlocal_bind=1
Network Confgiuration

ip addr show

1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UNKNOWN qlen 1000
    link/ether 00:15:5d:0a:09:05 brd ff:ff:ff:ff:ff:ff
    inet 192.168.4.117/24 brd 192.168.4.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::215:5dff:fe0a:905/64 scope link
       valid_lft forever preferred_lft forever
Listening Ports

ss --listening

[root@localhost ~]# ss --listening
Netid State      Recv-Q Send-Q                                                                                  Local Address:Port                                                                                      Peer Address:Port
nl    UNCONN     0      0                                                                                                rtnl:NetworkManager/792                                                                                               *
nl    UNCONN     0      0                                                                                                rtnl:kernel                                                                                                *
nl    UNCONN     0      0                                                                                                rtnl:avahi-daemon/671                                                                                               *
nl    UNCONN     0      0                                                                                                rtnl:4195096                                                                                               *
nl    UNCONN     4352   0                                                                                             tcpdiag:ss/3772                                                                                               *
nl    UNCONN     768    0                                                                                             tcpdiag:kernel                                                                                                *
nl    UNCONN     0      0                                                                                                   6:kernel                                                                                                *
nl    UNCONN     0      0                                                                                                   7:kernel                                                                                                *
nl    UNCONN     0      0                                                                                                   7:systemd/1                                                                                               *      
nl    UNCONN     0      0                                                                                                   7:dbus-daemon/680                                                                                               *
nl    UNCONN     0      0                                                                                                   9:auditd/640                                                                                               *     
nl    UNCONN     0      0                                                                                                   9:kernel                                                                                                *
nl    UNCONN     0      0                                                                                                   9:systemd/1                                                                                               *      
nl    UNCONN     0      0                                                                                                  10:kernel                                                                                                *
nl    UNCONN     0      0                                                                                                  11:kernel                                                                                                *
nl    UNCONN     0      0                                                                                                  15:iprdump/723                                                                                               *    
nl    UNCONN     0      0                                                                                                  15:systemd/1                                                                                               *      
nl    UNCONN     0      0                                                                                                  15:-4124                                                                                                 *
nl    UNCONN     0      0                                                                                                  15:systemd-logind/679                                                                                               *
nl    UNCONN     0      0                                                                                                  15:NetworkManager/792                                                                                               *
nl    UNCONN     0      0                                                                                                  15:iprinit/713                                                                                               *    
nl    UNCONN     0      0                                                                                                  15:-4107                                                                                                 *
nl    UNCONN     0      0                                                                                                  15:-4125                                                                                                 *
nl    UNCONN     0      0                                                                                                  15:-4119                                                                                                 *
nl    UNCONN     0      0                                                                                                  15:iprupdate/710                                                                                               *  
nl    UNCONN     0      0                                                                                                  15:-4118                                                                                                 *
nl    UNCONN     0      0                                                                                                  15:kernel                                                                                                *
nl    UNCONN     0      0                                                                                                  15:-4117                                                                                                 *
nl    UNCONN     0      0                                                                                                  15:tuned/676                                                                                               *      
nl    UNCONN     0      0                                                                                                  16:kernel                                                                                                *
nl    UNCONN     0      0                                                                                                  18:kernel                                                                                                *
u_str LISTEN     0      128                                                                           /run/lvm/lvmetad.socket 11542                                                                                                * 0
u_str LISTEN     0      128                                                                       /run/systemd/journal/stdout 6697                                                                                                 * 0
u_dgr UNCONN     0      0                                                                         /run/systemd/journal/socket 6700                                                                                                 * 0
u_dgr UNCONN     0      0                                                                                            /dev/log 6702                                                                                                 * 0
u_dgr UNCONN     0      0                                                                              /run/systemd/shutdownd 11321                                                                                                * 0
u_dgr LISTEN     0      128                                                                                 /run/udev/control 11338                                                                                                * 0
u_str LISTEN     0      100                                                                                      public/flush 18726                                                                                                * 0
u_str LISTEN     0      100                                                                                      public/showq 18741                                                                                                * 0
u_str LISTEN     0      30                                                               /var/run/NetworkManager/private-dhcp 17003                                                                                                * 0
u_dgr UNCONN     0      0                                                                   @/org/freedesktop/systemd1/notify 11259                                                                                                * 0
u_str LISTEN     0      100                                                                                    private/tlsmgr 18708                                                                                                * 0
u_str LISTEN     0      30                                                                    /var/run/NetworkManager/private 16518                                                                                                * 0
u_str LISTEN     0      128                                                                      /var/run/avahi-daemon/socket 13986                                                                                                * 0
u_str LISTEN     0      128                                                                   /var/run/dbus/system_bus_socket 13998                                                                                                * 0
u_str LISTEN     0      100                                                                                   private/rewrite 18711                                                                                                * 0
u_str LISTEN     0      100                                                                                    private/bounce 18714                                                                                                * 0
u_str LISTEN     0      100                                                                                     private/defer 18717                                                                                                * 0
u_str LISTEN     0      100                                                                                     private/trace 18720                                                                                                * 0
u_str LISTEN     0      100                                                                                    private/verify 18723                                                                                                * 0
u_str LISTEN     0      100                                                                                  private/proxymap 18729                                                                                                * 0
u_str LISTEN     0      100                                                                                private/proxywrite 18732                                                                                                * 0
u_str LISTEN     0      100                                                                                      private/smtp 18735                                                                                                * 0
u_str LISTEN     0      100                                                                                     private/relay 18738                                                                                                * 0
u_str LISTEN     0      100                                                                                     private/error 18744                                                                                                * 0
u_str LISTEN     0      100                                                                                     private/retry 18747                                                                                                * 0
u_str LISTEN     0      100                                                                                   private/discard 18750                                                                                                * 0
u_str LISTEN     0      100                                                                                     private/local 18753                                                                                                * 0
u_str LISTEN     0      100                                                                                   private/virtual 18756                                                                                                * 0
u_str LISTEN     0      100                                                                                      private/lmtp 18759                                                                                                * 0
u_str LISTEN     0      100                                                                                     private/anvil 18762                                                                                                * 0
u_str LISTEN     0      100                                                                                    private/scache 18765                                                                                                * 0
u_str LISTEN     0      100                                                                                     public/pickup 18697                                                                                                * 0
u_str LISTEN     0      100                                                                                    public/cleanup 18701                                                                                                * 0
u_str LISTEN     0      100                                                                                       public/qmgr 18704                                                                                                * 0
u_str LISTEN     0      30                                                                               /run/systemd/private 11261                                                                                                * 0
u_dgr UNCONN     0      0                                                                                                   * 14733                                                                                                * 6700
u_dgr UNCONN     0      0                                                                                                   * 15011                                                                                                * 6702
u_dgr UNCONN     0      0                                                                                                   * 12659                                                                                                * 12658
u_dgr UNCONN     0      0                                                                                                   * 18818                                                                                                * 6702
u_dgr UNCONN     0      0                                                                                                   * 15244                                                                                                * 6702
u_dgr UNCONN     0      0                                                                                                   * 16991                                                                                                * 6702
u_dgr UNCONN     0      0                                                                                                   * 12644                                                                                                * 6700
u_dgr UNCONN     0      0                                                                                                   * 12658                                                                                                * 12659
u_dgr UNCONN     0      0                                                                                                   * 19513                                                                                                * 6700
u_dgr UNCONN     0      0                                                                                                   * 29994                                                                                                * 6702
u_dgr UNCONN     0      0                                                                                                   * 13899                                                                                                * 6702
u_dgr UNCONN     0      0                                                                                                   * 16528                                                                                                * 6702
u_dgr UNCONN     0      0                                                                                                   * 30457                                                                                                * 6702
u_dgr UNCONN     0      0                                                                                                   * 18632                                                                                                * 6702
u_dgr UNCONN     0      0                                                                                                   * 16504                                                                                                * 6702
raw   UNCONN     0      0                                                                                                  :::ipv6-icmp                                                                                             :::*     
tcp   UNCONN     0      0                                                                                                   *:ipproto-5353                                                                                              *:*  
tcp   UNCONN     0      0                                                                                                   *:ipproto-50900                                                                                              *:* 
tcp   LISTEN     0      100                                                                                         127.0.0.1:smtp                                                                                                 *:*
tcp   LISTEN     0      128                                                                                                 *:ssh                                                                                                  *:*
tcp   LISTEN     0      100                                                                                               ::1:smtp                                                                                                :::*
tcp   LISTEN     0      128                                                                                                :::ssh                                                                                                 :::*
edited Jan 15 '16 at 1:19
Code Man
asked Jan 14 '16 at 15:52
Code Man
38311 gold badge44 silver badges1414 bronze badges
6 Answers

26

Thanks for you guys at first.
I have solved this issue by following command.
setsebool -P haproxy_connect_any=1

It works for me!

share|improve this answer
answered Jan 18 '16 at 3:27
Code ManCode Man
38311 gold badge44 silver badges1414 bronze badges

2

setsebool shows the right direction. It is a SELinux issue. Try to install the toolchain for SELinux: yum install policycoreutils policycoreutils-python selinux-policy selinux-policy-targeted libselinux-utils setroubleshoot-server setools setools-console mcstrans

Press the "Record-Button" by typing "selinux permissive" and try to start the services. They fail. Then: grep haprox /var/log/audit/audit.log | audit2allow -M haproxy and activate the haproxy permissions by

semodule -i haproxy.pp
Done!

share|improve this answer
answered Apr 26 '16 at 12:59
JottschiJottschi
2111 bronze badge

2

Add net.ipv4.ip_nonlocal_bind=1 on /etc/sysctl.conf

sysctl -p

Restart the haproxy service(service restart haproxy). it will work.

share|improve this answer
answered Dec 7 '16 at 4:42

Gnanasekar VeluGnanasekar Velu
2122 bronze badges

0

/etc/sysconfig/selinux SELINUX=permissive

reboot

worked for me

share|improve this answer
answered Feb 8 '18 at 10:46

sandejaisandejai
53411 gold badge77 silver badges2020 bronze badges

0

Code Man's answer works, but also you may manage selinux for your port with:

yum -y install policycoreutils-python
semanage port -m -t http_port_t -p tcp 8080
systemctl restart haproxy
systemctl status haproxy
share|improve this answer
answered Sep 27 '18 at 13:18
nd34567s32end34567s32e
6111 silver badge33 bronze badges

0

I would guess this is a SELinux issue. Try setenforce 0, then restart the HAProxy service. If HAProxy works after this change, restore the enforcing status with setenforce 1, and then run setsebool -P haproxy_connect_any to change the SELinux boolean that is probably affecting this, and restart the service again.

share|improve this answer
answered Feb 28 at 6:56
Raj RauloRaj Raulo
1111 bronze badge
Your Answer
Thanks for contributing an answer to Stack Overflow!

Please be sure to answer the question. Provide details and share your research!
But avoid …

Asking for help, clarification, or responding to other answers.
Making statements based on opinion; back them up with references or personal experience.
To learn more, see our tips on writing great answers.


draft saved
draft discarded
Sign up or log in
 Sign up using Google
 Sign up using Facebook
 Sign up using Email and Password
Post as a guest
Name
Email
Required, but never shown

Post Your Answer Discard
By clicking “Post Your Answer”, you agree to our terms of service, privacy policy and cookie policy
You Might Also Like
Poor man's VPN via ssh socks proxy
redpill-linpro.com· 3 min
It is late night. You have just arrived at your Grandparents, when the SMS beeper goes off. There is a problem with a SAN controller, and the on-call person know you fixed it the last time. Now, if you only had documented it. You know you have to fix this yourself, but you have no VPN access.


Save
Teleconsole – Share Your Linux Terminal with Your Friends
tecmint.com· 4 min
Teleconsole is a free open source and powerful command line tool for sharing your Linux terminal session with people you trust. Your friends or team members can connect to your Linux terminal session via a command-line over SSH or via a browser over HTTPS protocol.


Save
Building interactive SSH applications
drewdevault.com· 5 min
After the announcement of shell access for builds.sr.ht jobs, a few people sent me some questions, wondering how this sort of thing is done.


Save
