---
title: "Getting WifiOnICE to work on Ubuntu"
date: 2026-05-23T14:00:00
excerpt: "If your Deutsche Bahn ICE wifi is not loading the WifiOnICE connection page, the culprit is most likely an IP range collision;"
---

As mentioned in the [hello world post](./hello-world.html), one of the things I keep looking up is how to get the wifi on German ICE trains to work under Ubuntu.

Actually I then always find that it is no Ubuntu-specific problem, but a problem arising when an application uses an IP range that collides with the one used by the train's wifi.
And usually, the culprit is Docker, tailscale, or both.

So it is actually not an Ubuntu problem, but a problem arising when an application uses an IP range that collides with the one used by the train's wifi.

## The symptom

Connected to **WifiOnICE**, but the [landing page](./landing-page.html) does not load.

## Identifying the cause

## The cause

Once connected to the **WifiOnICE**, the following command (hopefully) reveals the culprit:
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
    "bip": "172.26.0.1/16"
}
```

Then restart the daemon:

```bash
sudo systemctl restart docker.service
```

Pick any private range that does not overlap with networks you commonly use; `172.26.0.0/16` has worked reliably for me on ICE trains so far.

Kudos to [1] for this solution.


### Tailscale
So far, I did not need to use Tailscale on ICE trains, so turning it off temporarily solved it for me:
```bash
sudo tailscale down
```

Reenable with `sudo tailscale up`.


[1] <https://develovers.de/2018/07/wifionice-und-docker/>
