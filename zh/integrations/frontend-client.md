# Frontend Client

在原生 JavaScript 或 TypeScript、Vue 3、React 或 Next.js 浏览器端应用中使用 `@users-au/client`。登记公开 OAuth 客户端，在项目中允许应用来源，并登记完整回调地址，例如 `https://app.example.com/auth/callback`。

```sh
npm install @users-au/client
```

登录页和回调页使用相同的配置：

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

在登录按钮中调用 `await client.login()`，并在同一浏览器标签页的回调页面调用 `await client.handleCallback()`。回调成功后，SDK 加载用户并跳转到 `afterLoginUrl`。会话存储在同一标签页的跳转期间保留 state 和 PKCE verifier。需要更新 Access Token 时调用 `refreshToken()`。

上面的示例使用 npm 已发布的 1.x 浏览器 API。使用仓库主分支文档中的偏好或服务端 API 前，请核对已安装的版本。

如果需要后端会话或机密客户端 PAR，请使用自己的后端或 [Next.js Starter Kit](nextjs-starter-kit.md)。Client Secret 应保存在后端。

[框架示例和 API 参考](https://github.com/Users-au/frontend-client) · [资料和偏好协议](https://github.com/Users-au/frontend-client/blob/main/docs/identity-preferences.md)
