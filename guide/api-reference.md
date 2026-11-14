# API reference

Reference for the public HTTP endpoints of a Users.au project. For the sign-in flow in narrative form, read [OAuth 2.0 and OpenID Connect](oauth-oidc.md). For claims and scopes, read [Profiles and interface preferences](profiles-preferences.md).

Every project has its own origin, for example `https://identity.example.com`. All paths below are relative to that origin. Read the project's [discovery document](#discovery) rather than hard-coding URLs.

| Endpoint | Method | Authentication | Purpose |
| --- | --- | --- | --- |
| [`/.well-known/openid-configuration`](#discovery) | GET | None | OIDC discovery document |
| [`/.well-known/jwks.json`](#jwks) | GET | None | ID token signing key |
| [`/oauth/authorize`](#authorize) | GET | User session (browser) | Start authorization |
| [`/oauth/token`](#token) | POST | Client credentials | Exchange a code, refresh a token |
| [`/api/user`](#userinfo) | GET | Bearer access token | UserInfo |
| [`/api/interface-preferences`](#preferences) | GET, PATCH | Bearer access token | Language, time zone and theme |
| [`/oauth/par`](#par) | POST | Client credentials (Basic) | Pushed authorization request |
| [`/oauth/context`](#context) | POST | Client credentials (Basic) | Branded account or sign-out navigation |

## Conventions

- Use HTTPS. Send `Accept: application/json` on API calls.
- Bearer endpoints expect `Authorization: Bearer <access-token>`.
- Responses from `/api/user`, `/api/interface-preferences`, `/oauth/par` and `/oauth/context` carry `Cache-Control: no-store`. Do not cache them.
- Error bodies from the preferences, PAR and context endpoints use an `error` key, for example `{"error": "invalid_request"}`. `/oauth/token` returns standard OAuth 2.0 error objects.
- Never log tokens, authorization codes, client secrets or refresh tokens.

## Discovery {#discovery}

```http
GET /.well-known/openid-configuration
```

No authentication. Returns the issuer and endpoint URLs for the project that served it:

```json
{
  "issuer": "https://identity.example.com",
  "authorization_endpoint": "https://identity.example.com/oauth/authorize",
  "pushed_authorization_request_endpoint": "https://identity.example.com/oauth/par",
  "token_endpoint": "https://identity.example.com/oauth/token",
  "userinfo_endpoint": "https://identity.example.com/api/user",
  "jwks_uri": "https://identity.example.com/.well-known/jwks.json",
  "scopes_supported": ["openid", "profile", "email", "phone", "address", "preferences:read", "preferences:write"],
  "id_token_signing_alg_values_supported": ["RS256"],
  "token_endpoint_auth_methods_supported": ["client_secret_basic", "client_secret_post"],
  "code_challenge_methods_supported": ["plain", "S256"],
  "subject_types_supported": ["public"]
}
```

The real document also lists supported response types, response modes, grant types and claims. Use `S256` for PKCE even though `plain` is advertised. The `issuer` value is the exact string to compare with the `iss` claim of an ID token.

## Signing keys (JWKS) {#jwks}

```http
GET /.well-known/jwks.json
```

No authentication. Returns `{"keys": [ ... ]}` with the RSA public key that signs ID tokens (RS256). Each ID token header carries a `kid`; select the key with the same `kid`. Cache the key set for a short period and refetch when you meet an unknown `kid`.

## Authorize {#authorize}

```http
GET /oauth/authorize
```

Send the user's browser here. The user signs in (if needed) and approves the request, then the browser returns to your `redirect_uri`.

| Parameter | Required | Notes |
| --- | --- | --- |
| `response_type` | Yes | `code`. |
| `client_id` | Yes | The application's Client ID. |
| `redirect_uri` | Yes | Must match a registered redirect URI exactly. |
| `scope` | Yes | Space-separated. Use `openid profile email` for sign-in. Without `scope`, the default is `openid`. |
| `state` | Yes | Fresh, unguessable, bound to the user's session. Verify and consume it on the callback. |
| `code_challenge` | Yes for public clients; recommended for all | PKCE challenge. |
| `code_challenge_method` | With `code_challenge` | `S256`. |
| `nonce` | Optional | Echoed in the ID token as `nonce`. |

On success the browser is redirected to `redirect_uri?code=...&state=...`. If the user denies access or a scope is unknown, the browser is redirected to your `redirect_uri` with `error` (for example `invalid_scope`), `error_description` and `state`. An unknown Client ID or an unregistered `redirect_uri` is not redirected: the endpoint answers `401` with `{"error": "invalid_client"}`. A confidential client that uses [pushed authorization](#par) sends `client_id` and `request_uri` instead of the other parameters.

## Token {#token}

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded
```

No user session. Authenticate the client with HTTP Basic (`client_secret_basic`) or with `client_id` and `client_secret` form fields (`client_secret_post`). Public clients send `client_id` only, together with `code_verifier`.

### Authorization code

| Field | Notes |
| --- | --- |
| `grant_type` | `authorization_code` |
| `code` | The code from the callback. Single use. |
| `redirect_uri` | The same value sent to `/oauth/authorize`. |
| `code_verifier` | The original PKCE verifier. |

### Refresh token

| Field | Notes |
| --- | --- |
| `grant_type` | `refresh_token` |
| `refresh_token` | The refresh token from the previous response. |
| `scope` | Optional. Can narrow the scope but not add to it. |

Each refresh token works once. A successful refresh returns a new access token and a new refresh token, and revokes the old ones: store the new refresh token and discard the old one. Requesting a scope that the original grant did not include fails with `invalid_scope`. Refreshing cannot add permissions. After you change the scopes your application requests, start a new authorization to obtain a grant with the new scopes.

### Errors

Failed requests return an OAuth 2.0 error object with `error` and `error_description`, and often a `hint`.

| Status | `error` | Cause |
| --- | --- | --- |
| 400 | `invalid_grant` | The code was already used or is expired or revoked, the PKCE `code_verifier` does not match, or the refresh token is invalid, revoked or already used. |
| 400 | `invalid_request` | A parameter is missing or invalid, including a `redirect_uri` that differs from the one used for authorization. |
| 400 | `invalid_scope` | A refresh request asked for a scope the original grant did not include. |
| 400 | `unsupported_grant_type` | Unknown `grant_type`. |
| 401 | `invalid_client` | Wrong Client ID or secret. |

### Response

```json
{
  "token_type": "Bearer",
  "expires_in": 31536000,
  "access_token": "eyJ0eXAiOi...",
  "refresh_token": "def50200...",
  "id_token": "eyJhbGciOi..."
}
```

`expires_in` is in seconds. By default, access tokens and refresh tokens are both valid for 365 days (`31536000` seconds) from issue. Read `expires_in` from the response instead of hard-coding the lifetime, and treat any `401` from a resource endpoint as the cue to refresh or sign in again.

`id_token` is present when the granted scopes include `openid` and either the authorization request carried a `nonce`, or ID tokens are enabled for the application in **Integration → OAuth Management**. Without both a `nonce` and that setting, the response has no `id_token`; send a `nonce` with every OIDC sign-in. The ID token is returned again when a refresh token is exchanged for an application that has ID tokens enabled.

### ID token

A JWT signed with RS256, valid for at most one hour (a shorter-lived access token shortens it). Verify the signature with the [JWKS](#jwks), then check `iss` (the discovery `issuer`), `aud` (your Client ID), `exp`, and `nonce` if you sent one.

| Claim | Notes |
| --- | --- |
| `iss`, `aud`, `sub`, `iat`, `exp` | Standard claims. `sub` is the stable user identifier. |
| `nonce` | Present when the request carried one. |
| Profile claims | With `profile`: see [claims](profiles-preferences.md). |
| `email`, `email_verified` | With `email`. |

Key your local accounts by `(iss, sub)`. Do not use email addresses or names as identifiers.

## UserInfo {#userinfo}

```http
GET /api/user
Authorization: Bearer <access-token>
```

Returns the signed-in user's claims, filtered by the access token's scopes:

```json
{
  "id": 42,
  "sub": "42",
  "name": "Alex Example",
  "picture": "https://identity.example.com/storage/profile-photos/alex.jpg",
  "locale": "en-AU",
  "zoneinfo": "Australia/Sydney",
  "updated_at": 1790000000,
  "email": "alex@example.com",
  "email_verified": true
}
```

| Scope | Adds |
| --- | --- |
| *(any)* | `id` and `sub`. |
| `profile` | `name`, `picture`, `locale`, `zoneinfo`, `updated_at`, plus `given_name`, `family_name`, `middle_name`, `nickname`, `preferred_username`, `profile`, `website`, `gender` and `birthdate` when the project collects them. |
| `email` | `email`, `email_verified`. |
| `phone` | `phone_number`, `phone_number_verified`, when collected. |
| `address` | `address` object (`formatted`, `street_address`, `locality`, `region`, `postal_code`, `country`), when collected. |
| `preferences:read` | `urn:usersau:preferences`, the [preferences snapshot](#preferences). |

`locale` and `zoneinfo` appear only once the user has set them. Claims that have no value, or that the project does not collect, are omitted rather than returned as `null`. Use `sub` (a string) as the identifier; `id` is returned for compatibility. Always match `sub` to the validated ID token before using the profile.

| Status | Meaning |
| --- | --- |
| 200 | Claims returned. |
| 401 | `{"message": "Unauthenticated."}`: the access token is missing, invalid, expired or revoked. |
| 403 | The user is blocked. |

## Interface preferences {#preferences}

Read and write the account's language, time zone and theme. Requires the `preferences:read` scope to read and `preferences:write` to write.

### Snapshot

```json
{
  "sub": "42",
  "locale": "en-AU",
  "timezone": "Australia/Sydney",
  "theme": "system",
  "version": 3
}
```

`locale` and `timezone` are `null` when unset. `theme` is `light`, `dark` or `system`. `version` changes whenever a preference changes.

### Read

```http
GET /api/interface-preferences
Authorization: Bearer <access-token>
```

Rate limit: 60 requests per minute. Returns the snapshot. 403 when the token lacks `preferences:read` or the user is blocked.

### Update

```http
PATCH /api/interface-preferences
Authorization: Bearer <access-token>
Content-Type: application/json

{"expected_version": 3, "theme": "dark", "timezone": "Australia/Melbourne"}
```

| Field | Notes |
| --- | --- |
| `expected_version` | Required. The `version` from your latest snapshot. |
| `locale` | Optional. A BCP 47 tag such as `en-AU` or `zh-CN`, up to 35 characters. |
| `timezone` | Optional. An IANA time zone such as `Australia/Sydney`. |
| `theme` | Optional. `light`, `dark` or `system`. |

Send only the fields you want to change. Returns the new snapshot. The request needs no CSRF token.

| Status | Meaning |
| --- | --- |
| 200 | Updated. |
| 403 | Missing `preferences:write`, or the user is blocked. |
| 409 | The version is stale. The body is `{"error": "preferences_conflict", "preferences": { ...current snapshot }}`. Reconcile with the current snapshot and retry with its `version`. |
| 422 | A field failed validation, or `expected_version` is missing. The body is `{"message": "...", "errors": {"<field>": ["..."]}}`. |

## Pushed authorization request (PAR) {#par}

A confidential client can send its authorization request from a trusted backend and give the browser only a short-lived reference. It is available to confidential authorization-code clients whose **Pushed Authorization Requests (PAR)** switch is enabled in **Integration → OAuth Management**.

```http
POST /oauth/par
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded
```

| Field | Notes |
| --- | --- |
| `client_id` | Must match the authenticated client. |
| `response_type` | `code`. |
| `scope` | Space-separated, from the supported scopes. |
| `redirect_uri` | HTTPS URL, up to 2048 characters. Plain HTTP is accepted only for `localhost` development hosts. |
| `state` | 20 to 512 characters. |
| `code_challenge` | S256 challenge, 43 URL-safe base64 characters. |
| `code_challenge_method` | `S256`. |
| `context` | JSON string, see [context object](#context-object). |

`request_uri` in the request is rejected. On success:

```http
HTTP/1.1 201 Created
```

```json
{
  "request_uri": "urn:ietf:params:oauth:request_uri:...",
  "expires_in": 300
}
```

Redirect the browser to `/oauth/authorize?client_id=<client-id>&request_uri=<request_uri>` within 300 seconds. The reference works once. The server resumes authorization with the pushed parameters and ignores parameters added to the browser URL. Then exchange the code at [`/oauth/token`](#token) with the original `redirect_uri` and PKCE verifier.

| Status | Meaning |
| --- | --- |
| 201 | Created. |
| 400 | `{"error": "invalid_request"}`: a field failed validation, the scope is unknown, a URL is not allowed, or `request_uri` was sent. |
| 401 | `{"error": "invalid_client"}`: missing or wrong credentials, a public or revoked client, a client without PAR enabled, or a `client_id` that does not match the authenticated client. |
| 429 | Rate limit exceeded: by default 600 requests per minute per IP address. |

### Context object {#context-object}

`context` is a JSON document with exactly these keys. Unknown keys are rejected.

```json
{
  "context_id": "workspace-42",
  "branding": {
    "name": "Workspace name",
    "logo_url": "https://cdn.example.com/logo.png",
    "logo_dark_url": "https://cdn.example.com/logo-dark.png",
    "favicon_url": "https://cdn.example.com/favicon.png",
    "theme_color": "#123456"
  },
  "links": {
    "home_url": "https://app.example.com/",
    "support_url": "https://app.example.com/help",
    "logout_url": "https://app.example.com/signed-out"
  }
}
```

| Field | Required | Rules |
| --- | --- | --- |
| `context_id` | Yes | Your stable identifier for the site, workspace or organization, up to 255 characters. It labels the request; it grants nothing. |
| `branding.name` | Yes | Up to 255 characters. |
| `branding.logo_url`, `logo_dark_url`, `favicon_url` | No | HTTPS URLs. Users.au never fetches them. |
| `branding.theme_color` | No | `#RRGGBB`. |
| `links.home_url` | Yes | HTTPS URL. Target of the logo and the account page's return action. |
| `links.logout_url` | No | HTTPS URL used after sign-out. |
| `links.support_url` | No | HTTPS URL. |

Build the context on your backend from trusted configuration. Do not let browsers or end users choose its values. Users.au uses it for appearance and navigation only; your application still checks membership and permissions.

## Application context {#context}

Opens hosted account management or sign-out with your branding, without starting an OAuth login.

```http
POST /oauth/context
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded
```

| Field | Notes |
| --- | --- |
| `client_id` | Must match the authenticated client. |
| `purpose` | `account` or `logout`. |
| `context` | JSON string, the same [context object](#context-object). |

Authentication, client policy, response (`201` with `request_uri` and `expires_in: 300`) and errors (`400` for an invalid `purpose` or context, `401` for `invalid_client`) are the same as for [`/oauth/par`](#par). Then send the browser to:

- `/account?client_id=<client-id>&request_uri=<request_uri>` for `purpose=account`.
- `/logout?client_id=<client-id>&request_uri=<request_uri>` for `purpose=logout`.

The reference works once and only for its purpose; it cannot be used at `/oauth/authorize`. Guests are asked to sign in first and then return to their account page. Create a new context each time you open account management or sign out. The branded context stays active for one hour.

## Errors at a glance

| Symptom | Likely cause |
| --- | --- |
| `invalid_client` at `/oauth/token` or `/oauth/par` | Wrong Client ID or secret, or a client type that cannot use the endpoint. |
| `invalid_grant` at `/oauth/token` | The code was already used or expired, `code_verifier` does not match, or the refresh token was already used. |
| `invalid_request` at `/oauth/token` | `redirect_uri` differs from the one used for authorization, or a parameter is missing. |
| `invalid_scope` | A scope that Users.au does not support, or a refresh request that adds a scope. |
| No `id_token` in the token response | No `nonce` was sent and ID tokens are not enabled for the application. |
| 401 from `/api/user` | The access token is missing, expired or revoked. Refresh it or sign in again. |
| 403 from preferences | Missing `preferences:read` or `preferences:write`. Start a new authorization. |
| 409 from preferences | Another client changed the preferences first. Retry with the returned `version`. |

## Compatibility

Existing integrations keep their behavior: endpoint paths, default scope, token and UserInfo shapes are stable. Breaking changes are published as a new versioned endpoint or an opt-in on the registered application, never as a silent change to these endpoints.
