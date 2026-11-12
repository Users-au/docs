# Laravel Client

通过 `users-au/laravel-client` 为已有 Laravel 应用接入托管登录。安装前查看所选版本支持的 PHP 与 Laravel 版本。

```sh
composer require users-au/laravel-client
php artisan vendor:publish --provider="Usersau\UsersauLaravelClient\UsersauLaravelClientServiceProvider"
php artisan migrate
```

登记机密 OAuth 客户端，并添加应用的 `/auth/usersau/callback` 完整地址。在 `config/services.php` 的 `usersau` 中配置 Client ID、Client Secret、回调地址和项目域名。通过私有环境配置提供 `USERSAU_CLIENT_ID`、`USERSAU_CLIENT_SECRET`、`USERSAU_REDIRECT_URI` 和 `USERSAU_HOST`。按仓库说明配置用户模型，避免在序列化响应中返回 Token 字段。

使用包提供的 `usersau.login` 路由发起登录。包也提供 `usersau.register`、`usersau.account` 和 `usersau.logout`。验证本地账户关联、权限检查与退出流程。

较新的 SDK 支持[机密客户端 PAR 与应用上下文](../guide/oauth-oidc.md#pushed-authorization-and-application-context)。升级现有接入前，核对所安装版本的默认行为，以及 OAuth 客户端的 PAR 设置。

[安装和路由参考](https://github.com/Users-au/laravel-client) · [资料和偏好协议](https://github.com/Users-au/laravel-client/blob/main/docs/identity-preferences.md)
