---
title: "Getting WifiOnICE (wifi on trains of Deutsche Bahn) to work on Ubuntu"
date: 2026-05-23T14:00:00
categories: [DEV, MISC]
excerpt: "If your Deutsche Bahn ICE wifi is not loading the WifiOnICE connection page, the culprit is most likely an IP range collision."
---

As mentioned in the [hello world post](./hello-world.html), one of the things I keep looking up is how to get the wifi on German ICE trains to work under Ubuntu.

Actually, it is not an Ubuntu-specific problem, but rather a problem that arises when an application on your machine uses an IP range that collides with the one used by the train's wifi.
In my case, the culprit is usually Docker, Tailscale, or both.

## The symptom

Connected to **WifiOnICE**, but the landing page does not load.

## Identifying the cause

Once connected to **WifiOnICE**, the following commands (hopefully) reveal the culprit:

```bash
resolvectl query login.wifionice.de
```

The output shows two things:
- The IP address of the train's gateway.
- The used link.

Does the link say something that reminds of tailscale or the IP address is `100.64.x.x`?
Then tailscale is likely the culprit.

Is the IP address `172.17.x.x`, or `172.18.x.x`?
Then Docker is likely the culprit.

## The fix
### Docker
The IP range used by WifiOnICE collides with Docker's default bridge network (`docker0`), which lives in `172.17.0.0/16` / `172.18.0.0/16` by default.
Once that bridge is up, packets meant for the train's gateway get routed into the Docker bridge and never reach the outside world.

Tell Docker to use a non-conflicting subnet for its default bridge. Edit (or create) `/etc/docker/daemon.json`:

```json
{
    "bip": "172.26.0.1/16",
    "default-address-pools": [
        { "base": "172.27.0.0/16", "size": 24 }
    ]
}
```

Then restart the daemon:

```bash
sudo systemctl restart docker.service
```

Pick any private range that does not overlap with networks you commonly use; `172.26.0.0/16` has worked reliably for me on ICE trains so far.

`bip` only moves the default `docker0` bridge.
Every user-defined network (the ones `docker compose` creates for you) is allocated from `default-address-pools`, which defaults to `172.17.0.0/12` and therefore lands right back in the colliding range.
That is why the second entry is needed.

Note that the pool's `base` is a *different* `/16` than `bip`, on purpose.

Existing networks keep the subnet they were assigned at creation time, so changing the config is not enough:

```bash
docker network prune
```

They get recreated from the new pool on the next `docker compose up`.
Note that this removes *all* networks not currently used by a container, not just the conflicting ones.

Kudos to [1] for the `bip` solution and to Peter K. for pointing out the part about pruning existing networks.


### Tailscale
So far, I did not need to use Tailscale on ICE trains, so turning it off temporarily solved it for me:
```bash
sudo tailscale down
```

Reenable with `sudo tailscale up`.

Best,
Gregor



[1] <https://develovers.de/2018/07/wifionice-und-docker/>
