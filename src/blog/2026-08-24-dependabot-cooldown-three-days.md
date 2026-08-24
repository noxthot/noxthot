---
title: "Dependabot now applies a 3-day cooldown by default; I still suggest 7"
date: 2026-08-24T13:23:00
excerpt: "GitHub made a cooldown the default for Dependabot version updates. Their number is 3 days, mine was 7, and I think there is a good reason to stay above the crowd."
---

In [an earlier post (May)](./supply-chain-vs-cve-balance.html) I argued that dependency management is a balancing act between two extremes: update immediately and eat the supply-chain attacks, or never update and eat the publicly known CVEs.
My proposed middle ground was a cooldown period before accepting new versions, with 7 days as a gut-feeling sweet spot.

In July, GitHub shipped exactly that mechanism as a default [1, 2].

## What GitHub did

Dependabot now waits **3 days** before opening a pull request for a version update.
No configuration needed, it is simply the new default.
The parts I found most interesting:

- **The numbers behind it are alarming.** The GitHub Advisory Database published more than 6,500 npm malware advisories in the year up to May 2026, roughly 18 newly catalogued malicious npm packages per day.
- **Attacks are fast, but so is detection.** In a review of 21 supply-chain incidents between 2018 and 2026, the malicious versions were each pulled within hours of publication. One npm attack in 2025 was live for about two hours.
- **The reasoning for 3 days**, quoted from the post: *"Three days as the default balances two goals: it pushes you past the window where most of these attacks live, and it doesn't hold your dependencies back longer than necessary."*
- **They are honest about the limits.** A cooldown does little against attacks that play a longer game: backdoors planted in a release and left dormant, maintainer sabotage, or a compromised build system.

You can change the window, or opt out entirely, via the `cooldown` option in your `dependabot.yml`.

## So, 3 days or 7?

The exact number matters far less than the fact that a cooldown now exists for everyone who never touches their config.
That single change probably prevents more incidents than any amount of arguing about days.

Still, I would stick with 7, and the reason is exactly *because* 3 is now the default.

A cooldown does not detect anything by itself.
It works because somebody else pulls the poisoned version first, gets burned or gets suspicious, and reports it.
Detection is a community effort, and the community needs a steady supply of people standing closer to the fire than you do.

With 3 days as the default for a very large population of repositories, that early-warning crowd just got much bigger and much faster.
Which means waiting a few extra days on top of the majority is now worth *more* than it was before: by day 7, whatever the 3-day crowd tripped over has already been caught, pulled from the registry and written up.
The bigger the herd moving at 3 days, the better the herd immunity for anyone at 7.

Two caveats I should be fair about:

1. That extra safety is paid for by somebody else's exposure.
2. Four extra days is four extra days of sitting on fixes and features.

My recommendation stays: Bump cooldown to 7 days and make sure your CVE handling is fast enough to cover the difference.

Best,
Gregor


[1] <https://github.blog/security/supply-chain-security/the-case-for-a-cooldown-why-dependabot-now-waits-before-issuing-version-updates/>

[2] <https://github.blog/changelog/2026-07-14-dependabot-version-updates-introduce-default-package-cooldown/>
