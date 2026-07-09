# Phase 37 — Sanity Studio automatic deploy

## Goal

Make the Sanity Studio deployment easier so the user does not have to manually run the GitHub Actions workflow every time.

## Changes made

### Studio deploy command

Updated:

```text
apps/studio/package.json
```

Deploy now runs non-interactively:

```bash
sanity deploy --yes --url fizioterapia-ime-blog --schema-required
```

Expected hosted Studio URL:

```text
https://fizioterapia-ime-blog.sanity.studio
```

### GitHub Actions workflow

Updated:

```text
.github/workflows/deploy-sanity-studio.yml
```

The workflow still supports manual run:

```text
Actions → Deploy Sanity Studio → Run workflow
```

It also auto-runs on pushes to `main` when these paths change:

```text
apps/studio/**
.github/workflows/deploy-sanity-studio.yml
```

### Secret validation

The workflow now checks if this secret exists:

```text
SANITY_AUTH_TOKEN
```

If the secret is missing, the workflow fails with a clear message.

## What should happen next

Because `apps/studio/README.md` was updated after the auto-run trigger was added, GitHub Actions should start the Studio deploy workflow automatically.

Check:

```text
GitHub → Actions → Deploy Sanity Studio
```

Expected result:

```text
green / success
```

Then check:

```text
Sanity → Fizioterapia ime Blog → Studios
```

Expected result:

```text
Fizioterapia ime Studio appears
```

## If it does not auto-run

Run it manually:

```text
GitHub → Actions → Deploy Sanity Studio → Run workflow
```

## If it fails

Open the red workflow run and check the failing step:

- `Verify Sanity deploy token exists` means `SANITY_AUTH_TOKEN` is missing or named wrong.
- `Build Studio` means Studio code/dependencies have an error.
- `Deploy Studio to Sanity hosting` means token permissions, hostname, or Sanity deploy access is the issue.

## Important

The production website blog is already live and connected to Sanity. This phase only deploys the Sanity editing UI so the Studio appears in the Sanity dashboard under `Studios`.
