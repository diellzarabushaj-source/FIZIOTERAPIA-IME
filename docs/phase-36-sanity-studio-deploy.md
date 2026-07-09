# Phase 36 — Sanity Studio deploy

## Problem

Sanity project exists and the website is already reading blog documents, but the Sanity dashboard tab `Studios` shows:

```text
There are no studios deployed for this project yet.
```

This is normal because documents were created through the API and the web blog is connected, but the Studio editing UI has not been deployed to Sanity hosting yet.

## What has been added

A manual GitHub Actions workflow was added:

```text
.github/workflows/deploy-sanity-studio.yml
```

It deploys:

```text
apps/studio
```

to Sanity Studio hosting for:

```text
Project ID: a3wcdlcy
Dataset: production
```

## Required GitHub secret

Before running the workflow, add this GitHub Actions secret:

```text
SANITY_AUTH_TOKEN
```

The token must be created from Sanity and must allow Studio deployment/content management for project `a3wcdlcy`.

Do not commit this token into GitHub files.

## How to create the token in Sanity

1. Open Sanity dashboard.
2. Open project `Fizioterapia ime Blog`.
3. Go to `API`.
4. Go to `Tokens`.
5. Create a new token.
6. Name it:

```text
GitHub Studio Deploy
```

7. Choose a role that can deploy/manage the Studio.
8. Copy the token once.

## How to add the token to GitHub

1. Open GitHub repo:

```text
diellzarabushaj-source/FIZIOTERAPIA-IME
```

2. Go to:

```text
Settings → Secrets and variables → Actions → New repository secret
```

3. Name:

```text
SANITY_AUTH_TOKEN
```

4. Value: paste the Sanity token.
5. Save.

## How to run the Studio deployment

1. Open GitHub repo.
2. Go to `Actions`.
3. Choose workflow:

```text
Deploy Sanity Studio
```

4. Click:

```text
Run workflow
```

5. Wait until it becomes green.

## Expected result

After the workflow succeeds, go back to Sanity:

```text
Project → Studios
```

You should see the deployed Studio.

Then open the Studio and you should see these content types:

```text
Post
Author
Category
```

## Important

The website blog already works live. This Studio deployment is only for the editor UI so posts can be edited visually in Sanity.

## Alternative local command

If you prefer deploying from your laptop instead of GitHub Actions:

```bash
cd apps/studio
npm install
npm run deploy
```

You may be asked to log in to Sanity from the browser.
