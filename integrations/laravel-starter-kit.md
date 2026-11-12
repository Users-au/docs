# Laravel Starter Kit

Start a Laravel application with hosted Users.au sign-in, Blade views and an authenticated dashboard. Install the PHP, Composer and Node.js versions listed by the repository.

```sh
git clone https://github.com/Users-au/laravel-starter-kit.git
cd laravel-starter-kit
bash ./install.sh
```

Set the database connection in `.env`. Register a confidential client for `http://localhost:8000/auth/usersau/callback`. Set `USERSAU_CLIENT_ID`, `USERSAU_CLIENT_SECRET`, `USERSAU_REDIRECT_URI` and `USERSAU_HOST` in `.env`.

```sh
php artisan migrate
php artisan serve
```

Open `http://localhost:8000` and test the sign-in flow through the dashboard. Before going live, register the production callback, use private environment variables and define the local permissions your app requires.

[Starter kit requirements and setup](https://github.com/Users-au/laravel-starter-kit)
