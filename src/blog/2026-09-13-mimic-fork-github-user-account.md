---
title: "How to mimic a fork of your own repository on GitHub (user account)"
date: 2026-09-13T10:00:00
categories: [DEV]
excerpt: "GitHub blocks forks of your own repo for personal accounts. Here is a simple Git workaround that keeps you able to pull upstream changes."
---

GitHub does not allow forks of your own repositories when using a **personal account** (it works fine for enterprise accounts).

If you still want the *workflow* of a fork (an independent copy where you experiment freely, while being able to pull in upstream changes) you can get close to that with a simple Git workaround.

## The workaround

### 1. Clone the original repo into a new directory

```bash
git clone ssh://git@github.com/your-username/original-repo.git my-fork
cd my-fork
```

### 2. Point your remote at your fork (currently empty) repository and push

Create an empty repository on GitHub (do **not** initialise it with a README or .gitignore), then:

```bash
git remote rename origin upstream
git remote add origin ssh://git@github.com/your-username/my-fork.git
git push -u origin main
```

You now have an independent copy that lives in your own repo.
From now on, `git push` only touches **your** repo and never the original.

## Get updates from your original repo

Whenever you want to sync with the original ("upstream") repository:

```bash
git fetch upstream
git merge upstream/main
```

Or, if you prefer a clean linear history:

```bash
git fetch upstream
git rebase upstream/main
```

This is essentially the same as pulling from the upstream branch; you just fetch first and merge explicitly so that your push target stays separate.

## Cherry-picking changes to your original repo

To move a specific commit from your fork back into the original repo, cherry-pick from the original repo's perspective, add your fork as a remote, fetch the commit, cherry-pick it, then push:

```bash
# In the original repo (or a clone of it)
git remote add myfork ssh://git@github.com/your-username/my-fork.git
git fetch myfork
git cherry-pick <commit-hash>
git push origin main
```

This is useful when you only need one commit (not the whole branch history) back in the original repo.

## Pulling changes from your original repo

To stay up to date with the original repository, fetch and merge (or rebase) from upstream:

```bash
git fetch upstream
git merge upstream/main
```

Or, if you prefer a clean linear history:

```bash
git fetch upstream
git rebase upstream/main
```

Then push the updated branch to your fork:

```bash
git push origin main
```

Best,
Gregor
