# Laravel Socialite

已有 Laravel 登录控制器和用户模型的应用，可以使用 `users-au/socialite-provider`。

```sh
composer require users-au/socialite-provider
```

1. 在 `config/services.php` 增加 `usersau`，配置 `client_id`、`client_secret`、`redirect` 和 `host`。其中 `host` 是 Users.au 项目的源地址，`redirect` 是已登记的完整应用回调地址。
2. 按当前 Laravel 版本的说明登记 `SocialiteWasCalled` 事件监听器。
3. 通过 `Socialite::driver('usersau')->redirect()` 发起登录。在回调中调用 `Socialite::driver('usersau')->user()`，验证 state 并获取资料。
4. 通过签发方和用户主体标识关联本地账户。建立会话前，检查应用的成员资格与权限。

Provider 2 将标准 `sub` 用作 Socialite ID，将 `picture` 映射为头像，并通过 `getRaw()` 提供已授权的声明。可选声明可能缺失。Client Secret 应保存在后端。

[Provider 配置和用户字段](https://github.com/Users-au/socialite-provider) · [SocialiteProviders 安装说明](https://socialiteproviders.com/usage/)
