# Frontend Client

Use `@users-au/client` in browser applications with vanilla JavaScript or TypeScript, Vue 3, React or the browser-based Next.js adapter. Register a public OAuth client and allow the app's origin in the project. Register the exact callback path, such as `https://app.example.com/auth/callback`.

```sh
npm install @users-au/client
```

Use the same configuration on the sign-in page and callback page:

```ts
import { UsersauClient } from '@users-au/client'

const client = new UsersauClient({
  host: 'https://identity.example.com',
  clientId: 'your-public-client-id',
  redirectUri: 'https://app.example.com/auth/callback',
  afterLoginUrl: '/dashboard',
  scopes: ['openid', 'profile', 'email'],
  storage: 'sessionStorage',
})
```

Call `await client.login()` from the sign-in button. Call `await client.handleCallback()` on the callback page in the same browser tab. After a successful callback, the SDK loads the user and navigates to `afterLoginUrl`. Session storage preserves the state and PKCE verifier through a same-tab redirect. Refresh tokens explicitly with `refreshToken()` when your app needs a new access token.

Check the installed package version before adopting the preferences or server APIs described on the repository’s main branch. The example above uses the published 1.x browser API.

For server-owned sessions or confidential PAR, use a backend or the [Next.js Starter Kit](nextjs-starter-kit.md). Keep client secrets out of JavaScript sent to the browser.

[Framework examples and API reference](https://github.com/Users-au/frontend-client) · [Profile and preferences contract](https://github.com/Users-au/frontend-client/blob/main/docs/identity-preferences.md)
