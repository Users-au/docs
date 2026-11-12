# Next.js Starter Kit

使用 Next.js Starter Kit 与 NextAuth v4 在服务端完成登录。模板包含登录后控制台、仅允许选定 Users.au 账户访问的选项，以及 Vercel 部署示例。

```sh
git clone https://github.com/Users-au/nextjs-starter-kit.git
cd nextjs-starter-kit
nvm install
nvm use
npm ci
npm run setup
```

配置生成的 `.env.local`。将 `NEXTAUTH_URL` 设为**应用**的源地址，将 `USERSAU_HOST` 设为 **Users.au 项目**的源地址。在服务端环境中配置 OAuth Client ID 与 Client Secret。开发环境登记 `http://localhost:3000/auth/usersau/callback`。生产环境使用部署后应用的 HTTPS 源地址与相同的回调路径。

运行 `npm run dev` 并打开 `http://localhost:3000`。按预期访问规则测试获准和被拒绝的用户。检查模板对 OAuth 客户端 PAR 的要求。在生产环境启用偏好同步时，按模板说明配置共享 Redis REST 授权存储。存储 Token、OAuth Secret 和 NextAuth Secret 均应保存在服务端。

[配置和访问策略](https://github.com/Users-au/nextjs-starter-kit) · [Vercel 部署](https://github.com/Users-au/nextjs-starter-kit/blob/main/VERCEL_DEPLOYMENT.md) · [偏好同步](https://github.com/Users-au/nextjs-starter-kit/blob/main/docs/identity-preferences.md)
