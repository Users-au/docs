# OAuth 2.0 与 OpenID Connect

从项目登录源地址读取 Discovery 文档，例如 `https://identity.example.com/.well-known/openid-configuration`。在整个流程中使用同一项目的签发方和端点。

| 用途 | 项目端点 |
| --- | --- |
| Discovery | `GET /.well-known/openid-configuration` |
| 签名公钥（JWKS） | `GET /.well-known/jwks.json` |
| 用户授权 | `GET /oauth/authorize` |
| 交换授权码或刷新 Token | `POST /oauth/token` |
| UserInfo | `GET /api/user` |
| 推送授权请求（PAR） | `POST /oauth/par` |
| 发起带品牌信息的账户管理或退出流程 | `POST /oauth/context` |

## 授权码登录

1. 将浏览器跳转到授权端点，携带 `response_type=code`、Client ID、已登记的 `redirect_uri` 和所需的 scope，例如 `openid profile email`。每次生成绑定到会话的 `state` 和 S256 PKCE challenge。OIDC 客户端使用 `nonce` 时也应每次重新生成。
2. 回调时先验证并消费 `state`，再交换授权码。使用相同的回调地址和原来的 PKCE verifier。机密客户端在后端验证客户端凭据。
3. 授权码包含 `openid` scope 时，Users.au 签发 RS256 签名的 ID Token。通过 OIDC 库使用签发方的 JWKS 验证签名，并检查签发方、受众、有效期以及发送过的 nonce。
4. 使用 Access Token 调用 UserInfo，请求头为 `Authorization: Bearer <access-token>`。使用资料前，将返回的 `sub` 与已验证的 ID Token 对照。通过 `(iss, sub)` 关联本地用户。

只请求应用使用的[声明和 scope](profiles-preferences.md)。日志中避免记录 Token、回调授权码和密钥。纯浏览器应用使用公开客户端、S256 PKCE 和获准的应用来源。由服务端接入时，可将 OAuth 凭据保存在后端，并单独为浏览器建立应用会话。

## 推送授权与应用上下文 {#pushed-authorization-and-application-context}

启用 PAR 的机密授权码客户端可以由可信后端向 `/oauth/par` 提交请求，再使用返回的短时 `request_uri` 和 Client ID 将浏览器跳转到授权端点。继续检查一次性 state、使用 S256，并通过原回调地址交换授权码。使用 PAR 前，检查已有 OAuth 客户端的 PAR 开关。

支持此功能的接入方式可以提交应用名称、品牌素材以及首页、支持或退出返回地址。这些值应来自已验证的后端配置。每次打开托管账户管理或退出登录时，生成一个对应操作的新 `/oauth/context` 请求。上下文用于外观和导航，应用后端仍需检查成员资格和权限。

## 排查流程

- **登录前**：检查项目域名、Client ID、允许的 scope 和完整回调地址。
- **回调时**：检查浏览器是否保留了原会话、state 和 PKCE 是否匹配、授权码是否只使用了一次。
- **验证 ID Token 时**：检查是否请求了 `openid`，以及签名公钥、受众和 nonce。
- **调用 UserInfo 时**：使用同一项目签发的 Access Token，并检查实际获准的 scope。
