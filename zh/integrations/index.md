# 选择接入方式

| 应用 | 指南 | 提供的功能 |
| --- | --- | --- |
| 原生 JavaScript 或 TypeScript、Vue 3、React、浏览器端 Next.js | [Frontend Client](frontend-client.md) | 浏览器端授权码登录和 PKCE。 |
| 已有 Laravel 应用 | [Laravel Client](laravel-client.md) | 路由、配置、数据库迁移与本地账户接入。 |
| 已有 Laravel 应用，自己维护身份验证控制器 | [Laravel Socialite](socialite-provider.md) | 为 Socialite 提供 Users.au OAuth 驱动。 |
| 新建 Laravel 应用 | [Laravel Starter Kit](laravel-starter-kit.md) | 带登录页和登录后控制台的示例应用。 |
| 新建 Next.js 应用，需要服务端登录 | [Next.js Starter Kit](nextjs-starter-kit.md) | NextAuth、服务端凭据和应用访问控制。 |
| Synology DSM | [Synology DSM](synology-dsm.md) | 通过 OpenID Connect 单点登录到已有 DSM 账户。 |
| 其他框架或 OIDC 客户端 | [OAuth 与 OpenID Connect](../guide/oauth-oidc.md) | Discovery 与授权码流程。 |

SDK 和 Starter Kit 由 [Users-au GitHub 组织](https://github.com/Users-au)维护。运行环境和版本要求以各仓库为准。
