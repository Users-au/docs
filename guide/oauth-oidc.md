# OAuth 2.0 and OpenID Connect

Read the discovery document at your project's sign-in origin, for example `https://identity.example.com/.well-known/openid-configuration`. Use its issuer and endpoint URLs for the same project.

| Operation | Project endpoint |
| --- | --- |
| Discovery | `GET /.well-known/openid-configuration` |
| Signing keys (JWKS) | `GET /.well-known/jwks.json` |
| Authorize | `GET /oauth/authorize` |
| Exchange code or refresh tokens | `POST /oauth/token` |
| UserInfo | `GET /api/user` |
| Pushed Authorization Request (PAR) | `POST /oauth/par` |
| Start branded account or logout navigation | `POST /oauth/context` |

## Authorization-code sign-in

1. Send the browser to the authorization endpoint with `response_type=code`, the Client ID, the registered `redirect_uri`, and requested scopes, for example `openid profile email`. Generate a new session-bound `state`, an S256 PKCE challenge, and a `nonce` when your OIDC client uses one.
2. On the callback, verify and consume `state` before exchanging the code. Use the same redirect URI and the original PKCE verifier. Authenticate confidential clients on the backend.
3. For an authorization-code exchange with the `openid` scope, Users.au issues an RS256-signed ID token. Use an OIDC library to verify its signature using the issuer's JWKS, expected issuer, audience, expiry and the nonce if one was sent.
4. Call UserInfo with the access token as `Authorization: Bearer <access-token>`. Match the returned `sub` to the validated ID token before using the profile. Link local users using `(iss, sub)`.

Request the [claims and scopes](profiles-preferences.md) your application uses. Keep tokens, callback codes and secrets out of logs. In a browser app use a public client, S256 PKCE and a permitted application origin. A server-based integration can hold OAuth credentials on the server and expose a separate application session to the browser.

## Pushed authorization and application context {#pushed-authorization-and-application-context}

A confidential authorization-code client with PAR enabled can post its request from a trusted backend to `/oauth/par` and send the browser to the authorization endpoint using the returned short-lived `request_uri` and Client ID. Continue checking one-time state, using S256 and exchanging the code with the original callback. Check the PAR setting for existing OAuth clients before enabling it in an integration.

Supported integrations can send a trusted context with an application name, optional brand assets and home, support or sign-out URLs. Resolve these from verified backend configuration. Use a fresh purpose-bound `/oauth/context` request when opening hosted account management or signing out. The supplied context controls appearance and navigation. Your application checks membership and permissions on its own backend.

## Troubleshoot the flow

- **Before login** — check the project host, Client ID, allowed scope and exact redirect URI.
- **On callback** — check the browser kept the initiating session, that state and PKCE match, and that the code was exchanged once.
- **On ID token validation** — check the `openid` scope, the issuer's signing key, token audience and nonce.
- **On UserInfo** — use an access token issued by the same project and check the scopes granted to the app.
