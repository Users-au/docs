# API 参考

Users.au 项目公开 HTTP 端点的参考。登录流程的叙述说明见 [OAuth 2.0 与 OpenID Connect](oauth-oidc.md)，声明和 scope 见[资料与界面偏好](profiles-preferences.md)。

每个项目都有自己的来源地址，例如 `https://identity.example.com`。下文路径均相对于该地址。请读取项目的 [Discovery 文档](#discovery)，不要硬编码 URL。

| 端点 | 方法 | 认证 | 用途 |
| --- | --- | --- | --- |
| [`/.well-known/openid-configuration`](#discovery) | GET | 无 | OIDC Discovery 文档 |
| [`/.well-known/jwks.json`](#jwks) | GET | 无 | ID Token 签名公钥 |
| [`/oauth/authorize`](#authorize) | GET | 用户会话（浏览器） | 发起授权 |
| [`/oauth/token`](#token) | POST | 客户端凭据 | 交换授权码、刷新 Token |
| [`/api/user`](#userinfo) | GET | Bearer Access Token | UserInfo |
| [`/api/interface-preferences`](#preferences) | GET、PATCH | Bearer Access Token | 语言、时区和主题 |
| [`/oauth/par`](#par) | POST | 客户端凭据（Basic） | 推送授权请求 |
| [`/oauth/context`](#context) | POST | 客户端凭据（Basic） | 带品牌信息的账户管理或退出导航 |

## 通用约定

- 使用 HTTPS。调用 API 时发送 `Accept: application/json`。
- Bearer 端点要求 `Authorization: Bearer <access-token>`。
- `/api/user`、`/api/interface-preferences`、`/oauth/par` 和 `/oauth/context` 的响应带有 `Cache-Control: no-store`，请勿缓存。
- 偏好、PAR 和 context 端点的错误体使用 `error` 字段，例如 `{"error": "invalid_request"}`。`/oauth/token` 返回标准 OAuth 2.0 错误对象。
- 不要在日志中记录 Token、授权码、客户端密钥或 Refresh Token。

## Discovery {#discovery}

```http
GET /.well-known/openid-configuration
```

无需认证。返回提供该文档的项目的签发方和端点 URL：

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

实际文档还列出支持的 response type、response mode、grant type 和 claim。虽然声明了 `plain`，请始终使用 `S256` 做 PKCE。`issuer` 的值就是与 ID Token 中 `iss` 比对的完整字符串。

## 签名公钥（JWKS）{#jwks}

```http
GET /.well-known/jwks.json
```

无需认证。返回 `{"keys": [ ... ]}`，其中是签署 ID Token（RS256）的 RSA 公钥。每个 ID Token 的头部带有 `kid`，请选择相同 `kid` 的密钥。可短时间缓存密钥集，遇到未知 `kid` 时重新获取。

## 授权 {#authorize}

```http
GET /oauth/authorize
```

将用户浏览器跳转到此处。用户按需登录并确认授权后，浏览器返回你的 `redirect_uri`。

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `response_type` | 是 | `code`。 |
| `client_id` | 是 | 应用的 Client ID。 |
| `redirect_uri` | 是 | 必须与已登记的回调地址完全一致。 |
| `scope` | 是 | 以空格分隔。登录用 `openid profile email`。未提供 `scope` 时默认为 `openid`。 |
| `state` | 是 | 每次新生成、不可预测并绑定用户会话。回调时验证并消费。 |
| `code_challenge` | 公开客户端必填，其他建议使用 | PKCE challenge。 |
| `code_challenge_method` | 与 `code_challenge` 同时 | `S256`。 |
| `nonce` | 可选 | 会原样出现在 ID Token 的 `nonce` 中。 |

成功时浏览器被重定向到 `redirect_uri?code=...&state=...`。用户拒绝或 scope 未知时，浏览器会被重定向到你的 `redirect_uri`，并带有 `error`（例如 `invalid_scope`）、`error_description` 和 `state`。Client ID 未知或 `redirect_uri` 未登记时不会重定向，端点直接返回 `401` 和 `{"error": "invalid_client"}`。使用[推送授权](#par)的机密客户端只发送 `client_id` 和 `request_uri`，不再发送其他参数。

## Token {#token}

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded
```

无需用户会话。使用 HTTP Basic（`client_secret_basic`）或表单字段 `client_id`、`client_secret`（`client_secret_post`）验证客户端。公开客户端只发送 `client_id`，并附带 `code_verifier`。

### 授权码

| 字段 | 说明 |
| --- | --- |
| `grant_type` | `authorization_code` |
| `code` | 回调中的授权码，只能使用一次。 |
| `redirect_uri` | 与发给 `/oauth/authorize` 的值相同。 |
| `code_verifier` | 原来的 PKCE verifier。 |

### 刷新 Token

| 字段 | 说明 |
| --- | --- |
| `grant_type` | `refresh_token` |
| `refresh_token` | 上一次响应中的 Refresh Token。 |
| `scope` | 可选。可以缩小范围，不能增加。 |

每个 Refresh Token 只能使用一次。刷新成功会返回新的 Access Token 和新的 Refresh Token，并使旧的失效：请保存新的 Refresh Token，丢弃旧的。请求原授权中没有的 scope 会返回 `invalid_scope`。刷新无法增加权限。修改应用请求的 scope 后，需重新发起授权以获得带新 scope 的授权。

### 错误

失败的请求返回 OAuth 2.0 错误对象，含 `error` 和 `error_description`，通常还有 `hint`。

| 状态码 | `error` | 原因 |
| --- | --- | --- |
| 400 | `invalid_grant` | 授权码已使用、已过期或已撤销，PKCE `code_verifier` 不匹配，或 Refresh Token 无效、已撤销或已使用过。 |
| 400 | `invalid_request` | 参数缺失或无效，包括 `redirect_uri` 与授权时使用的不一致。 |
| 400 | `invalid_scope` | 刷新时请求了原授权中没有的 scope。 |
| 400 | `unsupported_grant_type` | `grant_type` 未知。 |
| 401 | `invalid_client` | Client ID 或密钥错误。 |

### 响应

```json
{
  "token_type": "Bearer",
  "expires_in": 31536000,
  "access_token": "eyJ0eXAiOi...",
  "refresh_token": "def50200...",
  "id_token": "eyJhbGciOi..."
}
```

`expires_in` 的单位是秒。默认情况下，Access Token 和 Refresh Token 自签发起都有效 365 天（`31536000` 秒）。请从响应中读取 `expires_in`，不要硬编码有效期；资源端点返回 `401` 时，刷新 Token 或重新登录。

获准的 scope 包含 `openid`，并且授权请求带有 `nonce`，或在 **Integration → OAuth Management** 中为该应用启用了 ID Token 时，才会返回 `id_token`。如果既没有 `nonce` 也没有启用该设置，响应中就没有 `id_token`，因此每次 OIDC 登录都应发送 `nonce`。对已启用 ID Token 的应用，用 Refresh Token 换取新 Token 时也会再次返回 ID Token。

### ID Token

使用 RS256 签名的 JWT，有效期最长一小时（Access Token 的有效期更短时随之缩短）。先用 [JWKS](#jwks) 验证签名，再检查 `iss`（Discovery 的 `issuer`）、`aud`（你的 Client ID）、`exp`，以及发送过的 `nonce`。

| Claim | 说明 |
| --- | --- |
| `iss`、`aud`、`sub`、`iat`、`exp` | 标准声明。`sub` 是稳定的用户标识。 |
| `nonce` | 请求带有 nonce 时返回。 |
| 资料声明 | 带 `profile` 时返回，见[声明](profiles-preferences.md)。 |
| `email`、`email_verified` | 带 `email` 时返回。 |

本地账号请使用 `(iss, sub)` 关联。不要用邮箱或姓名作为标识。

## UserInfo {#userinfo}

```http
GET /api/user
Authorization: Bearer <access-token>
```

返回已登录用户的声明，按 Access Token 的 scope 过滤：

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

| Scope | 增加的内容 |
| --- | --- |
| *（任意）* | `id` 和 `sub`。 |
| `profile` | `name`、`picture`、`locale`、`zoneinfo`、`updated_at`，以及项目收集时的 `given_name`、`family_name`、`middle_name`、`nickname`、`preferred_username`、`profile`、`website`、`gender`、`birthdate`。 |
| `email` | `email`、`email_verified`。 |
| `phone` | 收集时的 `phone_number`、`phone_number_verified`。 |
| `address` | 收集时的 `address` 对象（`formatted`、`street_address`、`locality`、`region`、`postal_code`、`country`）。 |
| `preferences:read` | `urn:usersau:preferences`，即[偏好快照](#preferences)。 |

`locale` 和 `zoneinfo` 只有在用户设置后才会出现。没有值或项目未收集的声明会被省略，不会返回 `null`。请使用字符串 `sub` 作为标识，`id` 仅为兼容而保留。使用资料前，务必将 `sub` 与已验证的 ID Token 对照。

| 状态码 | 含义 |
| --- | --- |
| 200 | 返回声明。 |
| 401 | `{"message": "Unauthenticated."}`：Access Token 缺失、无效、过期或已撤销。 |
| 403 | 用户已被封禁。 |

## 界面偏好 {#preferences}

读取和写入账号的语言、时区和主题。读取需要 `preferences:read`，写入需要 `preferences:write`。

### 快照

```json
{
  "sub": "42",
  "locale": "en-AU",
  "timezone": "Australia/Sydney",
  "theme": "system",
  "version": 3
}
```

未设置时 `locale` 和 `timezone` 为 `null`。`theme` 为 `light`、`dark` 或 `system`。偏好变化时 `version` 随之变化。

### 读取

```http
GET /api/interface-preferences
Authorization: Bearer <access-token>
```

限速：每分钟 60 次请求。返回快照。Token 缺少 `preferences:read` 或用户被封禁时返回 403。

### 更新

```http
PATCH /api/interface-preferences
Authorization: Bearer <access-token>
Content-Type: application/json

{"expected_version": 3, "theme": "dark", "timezone": "Australia/Melbourne"}
```

| 字段 | 说明 |
| --- | --- |
| `expected_version` | 必填。最近一次快照中的 `version`。 |
| `locale` | 可选。BCP 47 标签，如 `en-AU` 或 `zh-CN`，最长 35 个字符。 |
| `timezone` | 可选。IANA 时区，如 `Australia/Sydney`。 |
| `theme` | 可选。`light`、`dark` 或 `system`。 |

只发送要修改的字段。返回新的快照。该请求不需要 CSRF token。

| 状态码 | 含义 |
| --- | --- |
| 200 | 已更新。 |
| 403 | 缺少 `preferences:write`，或用户被封禁。 |
| 409 | 版本已过期。响应体为 `{"error": "preferences_conflict", "preferences": { ...当前快照 }}`。请与当前快照合并后，用其 `version` 重试。 |
| 422 | 字段校验失败，或缺少 `expected_version`。响应体为 `{"message": "...", "errors": {"<字段>": ["..."]}}`。 |

## 推送授权请求（PAR）{#par}

机密客户端可以由可信后端提交授权请求，只把一个短时引用交给浏览器。适用于在 **Integration → OAuth Management** 中启用了 **Pushed Authorization Requests (PAR)** 开关的机密授权码客户端。

```http
POST /oauth/par
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded
```

| 字段 | 说明 |
| --- | --- |
| `client_id` | 必须与已认证的客户端一致。 |
| `response_type` | `code`。 |
| `scope` | 以空格分隔，取自支持的 scope。 |
| `redirect_uri` | HTTPS URL，最长 2048 个字符。仅 `localhost` 开发主机允许 HTTP。 |
| `state` | 20 到 512 个字符。 |
| `code_challenge` | S256 challenge，43 个 URL 安全的 base64 字符。 |
| `code_challenge_method` | `S256`。 |
| `context` | JSON 字符串，见 [context 对象](#context-object)。 |

请求中带有 `request_uri` 会被拒绝。成功时：

```http
HTTP/1.1 201 Created
```

```json
{
  "request_uri": "urn:ietf:params:oauth:request_uri:...",
  "expires_in": 300
}
```

在 300 秒内把浏览器跳转到 `/oauth/authorize?client_id=<client-id>&request_uri=<request_uri>`。该引用只能使用一次。服务端会用已推送的参数继续授权，并忽略浏览器地址中额外添加的参数。然后在 [`/oauth/token`](#token) 使用原来的 `redirect_uri` 和 PKCE verifier 交换授权码。

| 状态码 | 含义 |
| --- | --- |
| 201 | 已创建。 |
| 400 | `{"error": "invalid_request"}`：字段校验失败、scope 未知、URL 不被允许，或带了 `request_uri`。 |
| 401 | `{"error": "invalid_client"}`：缺少或错误的凭据、公开或已撤销的客户端、未启用 PAR 的客户端，或 `client_id` 与已认证的客户端不一致。 |
| 429 | 超过限速：默认每个 IP 地址每分钟 600 次请求。 |

### context 对象 {#context-object}

`context` 是只允许下列键的 JSON 文档，未知键会被拒绝。

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

| 字段 | 必填 | 规则 |
| --- | --- | --- |
| `context_id` | 是 | 你为站点、工作区或组织定义的稳定标识，最长 255 个字符。仅作标记，不授予任何权限。 |
| `branding.name` | 是 | 最长 255 个字符。 |
| `branding.logo_url`、`logo_dark_url`、`favicon_url` | 否 | HTTPS URL。Users.au 不会抓取这些地址。 |
| `branding.theme_color` | 否 | `#RRGGBB`。 |
| `links.home_url` | 是 | HTTPS URL。Logo 和账户页返回操作的目标地址。 |
| `links.logout_url` | 否 | 退出登录后使用的 HTTPS URL。 |
| `links.support_url` | 否 | HTTPS URL。 |

请在后端根据可信配置构造 context，不要让浏览器或终端用户决定其中的值。Users.au 只将它用于外观和导航，成员资格和权限仍由你的应用检查。

## 应用上下文 {#context}

用你的品牌信息打开托管的账户管理或退出登录页面，不会发起 OAuth 登录。

```http
POST /oauth/context
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded
```

| 字段 | 说明 |
| --- | --- |
| `client_id` | 必须与已认证的客户端一致。 |
| `purpose` | `account` 或 `logout`。 |
| `context` | JSON 字符串，与上面相同的 [context 对象](#context-object)。 |

认证方式、客户端策略、响应（`201`，含 `request_uri` 和 `expires_in: 300`）和错误（`purpose` 或 context 无效时 `400`，`invalid_client` 时 `401`）都与 [`/oauth/par`](#par) 相同。随后将浏览器跳转到：

- `purpose=account`：`/account?client_id=<client-id>&request_uri=<request_uri>`。
- `purpose=logout`：`/logout?client_id=<client-id>&request_uri=<request_uri>`。

该引用只能使用一次，并且只适用于对应的用途，不能用于 `/oauth/authorize`。访客会先被要求登录，再回到账户页面。每次打开账户管理或退出登录都应新建一个 context。带品牌信息的上下文保持一小时有效。

## 常见错误

| 现象 | 可能原因 |
| --- | --- |
| `/oauth/token` 或 `/oauth/par` 返回 `invalid_client` | Client ID 或密钥错误，或客户端类型不能使用该端点。 |
| `/oauth/token` 返回 `invalid_grant` | 授权码已使用或过期、`code_verifier` 不匹配，或 Refresh Token 已使用过。 |
| `/oauth/token` 返回 `invalid_request` | `redirect_uri` 与授权时使用的不一致，或缺少参数。 |
| `invalid_scope` | 请求了 Users.au 不支持的 scope，或刷新时增加了 scope。 |
| 响应中没有 `id_token` | 没有发送 `nonce`，且该应用未启用 ID Token。 |
| `/api/user` 返回 401 | Access Token 缺失、过期或已撤销。请刷新 Token 或重新登录。 |
| 偏好接口返回 403 | 缺少 `preferences:read` 或 `preferences:write`，需重新发起授权。 |
| 偏好接口返回 409 | 其他客户端先修改了偏好，请用返回的 `version` 重试。 |

## 兼容性

现有集成保持原有行为：端点路径、默认 scope、Token 和 UserInfo 的结构保持稳定。破坏性变更会作为新的版本化端点，或需要已登记应用主动启用，不会悄悄修改这些端点。
