---
title: "Train wifi shows no login page: is it the train or is it me?"
date: 2026-10-29T09:00:00
categories: [DEV, MISC]
excerpt: "A two-minute check to decide whether a train's wifi is broken or your laptop is, before you spend half an hour debugging the wrong one."
---

This morning on an ÖBB train: connected to the `OEBB` wifi, no login page.
Having been bitten before by Docker and Tailscale getting in the way of a train's network (see the [WifiOnICE post](./wifionice-docker-conflict.html)), I went straight into debugging the laptop.
Tailscale, DNS overrides, MAC randomisation, wifi power-save, both bands, DHCP timeouts up to 120 seconds.
Every attempt looked the same: wifi associated within a second and stayed up, NetworkManager logged `dhcp4: beginning transaction`, and then nothing.

Ten minutes later I tried the phone.
No login page there either.
The train simply never handed out an IP address, and nothing on the laptop could have fixed that.

Lesson: give it a quick sanity check before entering the rabbit hole of debugging.

## The quick check

Connect to the train's wifi, then run:

```bash
nmcli networking connectivity check; ip -4 route | grep '^default' || echo "NO IP FROM TRAIN"
```

Read the result top to bottom and stop at the first match:

| Output | Meaning | Do |
|---|---|---|
| `full` | already logged in | nothing |
| `portal` | train works, the browser just did not get redirected | open <http://neverssl.com> (which should get you redirected) or the operator's portal, e.g. <http://railnet.oebb.at> |
| `limited` or `none`, **with** a `default via ...` line | you got an IP, but nothing beyond the gateway works | wait 30 s and rerun; still `limited`? something on the laptop is in the way, see below |
| `limited` or `none`, and `NO IP FROM TRAIN` | DHCP never answered | check the phone |

Still no connection, check the phone to see if the issue is (most likely) with the train network or the laptop.


## Got an IP, still `limited`: something on the laptop is in the way

This is where the Docker and Tailscale cases from the [WifiOnICE post](./wifionice-docker-conflict.html) live, together with everything else that touches routing or DNS: VPN clients (WireGuard, OpenVPN, corporate ones), VM and container bridges (`virbr0`, `vboxnet0`, `lxdbr0`), local DNS proxies.

With a lease, two questions remain: which link answers DNS for the portal, and which interface would packets to that answer leave on?

```bash
resolvectl query railnet.oebb.at    # login.wifionice.de on DB trains; ends with "-- link: wlp0s20f3"?
ip route get <address from above>   # says "dev wlp0s20f3"?
```

`wlp0s20f3` is my wifi interface, `nmcli device status` lists yours.
Both must name the wifi interface.
If either names something else (`tailscale0`, `docker0`, `br-*`, `tun0`, `wg0`, `virbr0`), that is the culprit: take it down for the trip (`sudo tailscale down`, `sudo ip link set docker0 down`, quit the VPN client, ...) and rerun the check.
The permanent fixes for Docker and Tailscale are in the older post.

Two details worth knowing:

- `ip route get` honours policy routing. That matters for Tailscale, which keeps its routes in a separate table that plain `ip -4 route` never shows, so comparing subnets by eye would miss it.
- If the DNS query fails outright, `resolvectl status` shows which link owns the DNS servers. E.g. Tailscale's `100.100.100.100` on `tailscale0` instead of the train's server on the wifi link is the same culprit.

If both commands name the wifi interface and the page still does not load, further suspects would be a firewall or VPN kill switch dropping everything outside the tunnel.

Good luck,
Gregor
