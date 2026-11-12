# Users.au documentation

English and Simplified Chinese documentation for the Users.au identity platform.

- [English documentation](https://docs.users.au/)
- [简体中文文档](https://docs.users.au/zh/)
- Synology DSM with OpenID Connect — [English](integrations/synology-dsm.md) · [简体中文](zh/integrations/synology-dsm.md)

## Development

Use the Node.js version in `.nvmrc`.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

English pages live in the repository root, `guide/` and `integrations/`. Add Chinese counterparts at the same path under `zh/`. Use example domains and placeholder credentials.

## Deployment

The GitHub Actions workflow builds on every pull request. A push to `main` publishes the checked revision to Vercel after the build and dependency audit pass. The workflow can also be run manually from `main`.

Create a Vercel project using the Other framework preset and add `docs.users.au` under its Domains settings. Apply the DNS record shown by Vercel and verify the domain. In the GitHub `production` environment set variables `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`, and the secret `VERCEL_TOKEN`. Use a token with access to the selected Vercel scope and restrict the environment's deployment branches to `main`. GitHub Actions sends the audited static files directly to the [Vercel deployment API](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment). Vercel serves the uploaded files as-is and records the source commit in deployment metadata.

Once the custom domain serves the docs, verify the English and Chinese entry points and update the public website's Docs links.
