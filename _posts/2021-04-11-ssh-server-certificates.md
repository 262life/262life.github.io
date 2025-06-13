---
layout: single
author_profile: true
title:  "SSH Server with CERTIFICATES"
summary: "The documentation for OpenSSH certificates..."
read_time: true
comments: true
share: false
related: false
collection: examples

---
# SSH Server with CERTIFICATES

The documentation for OpenSSH certificates (introduced in OpenSSH 5.4) are, shall we say, a bit lacking. So I’m writing down the essentials of what they are and how to use them.

## What they are NOT

### They’re not SSH PubkeyAuthentication

In other words if your `.pub` file doesn’t end in `-cert.pub` and you haven’t used `ssh-keygen -s`, then you aren’t using certificates.

### They’re not SSL

Still the same SSH protocol.

### They’re not PEM, x509 ASN.1 or any other insane format

This means you cannot get your keys signed by Verisign or any other root CA. And you cannot use multiple levels of CA.

### They’re not easy to google for

Most hits will be about normal pubkey authentication. Some will be about older patches to one SSH implementation or another that added some form of PKI, even x509 support. You’ll probably have the most luck googling for “ssh-keygen -s” (with the quotes).

## What they do

### Sign host keys

If an organization publishes their host-key-signing CA’s public key you can just get that and you’ll never have to see the familiar:

```
The authenticity of host 'xxx' can't be established.
RSA key fingerprint is xxx.
Are you sure you want to continue connecting (yes/no)?
```

### Sign user keys

Instead of copying your public key into thousands of servers `~/.ssh/authorized_keys` you just have the user CA public key there (or system wide) and with one change it’s ready for all future users of the system.

### Either or both of the above

User CA and host CA don’t depend on each other. They don’t have to have the same key.

### Allow you to expire certs

While *keys* don’t expire, the *certs* can if you want.

## Setting up host certificates

1. On the machine that you’ll be storing your CA on: Create host CA key (host_ca & host_ca.pub):

```
ssh-keygen -f host_ca
```

2. Sign existing host public key:

```
ssh-keygen -s host_ca -I host_foo -h -n foo.bar.com -V +52w /etc/ssh/ssh_host_rsa_key.pub
```

2. Copy /etc/ssh/ssh_host_rsa_key.pub from other servers and this command on those files too, and copy the resulting back to the server.

3. Configure server(s) to present certificate (/etc/ssh/sshd_config):

```
HostCertificate /etc/ssh/ssh_host_rsa_key-cert.pub
```

3. and restart sshd.

4. Put host CA in clients known_hosts, such as `~/.ssh/known_hosts` or a system-wide one. The line should look something like this:

```
@cert-authority *.bar.com ssh-rsa AAAAB3[...]== Comment
```

5. Remove clients entry (including aliases such as its IP address) for the host itself in ~/.ssh/known_hosts (if any)

6. Logging in to the correct name should now work and you should not be asked about the host key: `  `  ` ssh foo.bar.com

7. Logging in to the IP address of the machine should present the message: “Certificate invalid: name is not a listed principal”

Do NOT forget the `-n` switch when creating host certificates. Otherwise anyone who cracks one machine will be able to impersonate any other machine in the domain to users who trust this CA.

You may need to add something like this to your client config (~/.ssh/config):

```
Host *
    HostKeyAlgorithms ssh-dss-cert-v01@openssh.com,ssh-dss
```

It worked for me without it, but some have needed it.

## Setting up user certificates

1. On the machine you’ll be storing your CA on: Create user CA key ( `user_ca` & `user_ca.pub` ):

```
ssh-keygen -f user_ca
```

2. For every server that the certificates should work on:

	* Copy `user_ca.pub` from the CA machine to `/etc/ssh/` on the server.
	* Add `user_ca.pub` to servers `/etc/ssh/sshd_config`: `TrustedUserCAKeys /etc/ssh/user_ca.pub`
	* Restart sshd.

3. For each user: Sign existing user pubkey key:

```
ssh-keygen -s user_ca -I user_thomas -n thomas,thomas2 -V +52w /path/to/id_rsa.pub
```

3. Give the resulting `*-cert.pub` file back to the user.

4. Log in as user Thomas or thomas2 on the server, even though the server has never seen your key or cert before, only `user_ca.pub`.

## Some notes

* Never forget `-n` when creating host certs.
* If you put your user CA in `~/.ssh/authorized_keys` instead of configuring the server you don’t need `-n` for user certs. If you’re doing system-wide (as described) it’s mandatory.
* The certificate validity time is in UTC
* You can revoke keys and certs with `RevokeKeys`
* `-I` just specifies the key ID. It doesn’t have to follow the pattern I used.
* Print certificate information with `ssh-keygen -L`:

```
$ ssh-keygen -L -f user-thomas-cert.pub
user-thomas-cert.pub:
        Type: ssh-rsa-cert-v00@openssh.com user certificate
        Public key: RSA-CERT-V00 a4:b3:6d:e2:bd:4a:39:01:31:c9:05:43:db:78:f6:c9
        Signing CA: RSA a5:e5:20:8e:ea:ea:15:7e:c3:31:60:2d:6b:93:a0:6b
        Key ID: "user_thomas"
        Valid: from 2011-07-07T15:37:00 to 2012-07-05T15:38:11
        Principals:
                thomas
                thomas2
        Critical Options:
                permit-agent-forwarding
                permit-port-forwarding
                permit-pty
                permit-user-rc
                permit-X11-forwarding
```

## Update (2012-09-12)

The certificate cert format seems to have changed between 5.5 and 6.0. /sigh/. New certs can’t be used to connect to old servers. To see the cert version run:

```
$ ssh-keygen -L -f id_rsa-cert.pub | grep Type
        Type: ssh-rsa-cert-v01@openssh.com user certificate
```

“v01” means new version. If you have servers that can only handle version v00 certificates then you should generate version v00 certificates for users:

```
$ ssh-keygen -t v00 -s user-ca -I thomas@home -n thomas -V +52w id_rsa.pub
```

## Links

* [Email thread: getting host certificates working](http://www.gossamer-threads.com/lists/openssh/users/50165)
* [Serverfault: How to revoke an SSH certificate](https://serverfault.com/questions/264515/how-to-revoke-an-ssh-certificate-not-ssh-identity-file)

[View the comments.](https://blargh.disqus.com/?url=ref&amp;https)  
