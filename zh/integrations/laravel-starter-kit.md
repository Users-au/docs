# Laravel Starter Kit

从带有 Users.au 托管登录、Blade 页面和登录后控制台的模板创建 Laravel 应用。按仓库说明安装对应版本的 PHP、Composer 和 Node.js。

```sh
git clone https://github.com/Users-au/laravel-starter-kit.git
cd laravel-starter-kit
bash ./install.sh
```

在 `.env` 中配置数据库连接。登记机密客户端，添加回调地址 `http://localhost:8000/auth/usersau/callback`。在 `.env` 中设置 `USERSAU_CLIENT_ID`、`USERSAU_CLIENT_SECRET`、`USERSAU_REDIRECT_URI` 和 `USERSAU_HOST`。

```sh
php artisan migrate
php artisan serve
```

打开 `http://localhost:8000`，测试从登录到进入控制台的过程。上线前登记生产回调地址，使用私有环境变量，并配置应用需要的本地访问权限。

[模板环境要求与配置](https://github.com/Users-au/laravel-starter-kit)
