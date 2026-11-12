# Next.js Starter Kit

Use the Next.js Starter Kit for server-side sign-in with NextAuth v4. It includes a dashboard, an option to restrict access to selected Users.au accounts, and an example Vercel deployment.

```sh
git clone https://github.com/Users-au/nextjs-starter-kit.git
cd nextjs-starter-kit
nvm install
nvm use
npm ci
npm run setup
```

Configure the generated `.env.local`. Set `NEXTAUTH_URL` to your **application** origin and `USERSAU_HOST` to the **Users.au project** origin. Set the OAuth Client ID and secret in the server environment. Register `http://localhost:3000/auth/usersau/callback` for local development. The production callback uses the same path on the deployed app's HTTPS origin.

Run `npm run dev` and open `http://localhost:3000`. Test admitted and rejected users against your intended access policy. Check the starter's PAR prerequisites for your OAuth client. When enabling preference synchronization in production, configure the documented shared Redis REST grant store. Keep the store token, OAuth secret and NextAuth secret server-side.

[Setup and access policy](https://github.com/Users-au/nextjs-starter-kit) · [Vercel deployment](https://github.com/Users-au/nextjs-starter-kit/blob/main/VERCEL_DEPLOYMENT.md) · [Preference synchronization](https://github.com/Users-au/nextjs-starter-kit/blob/main/docs/identity-preferences.md)
