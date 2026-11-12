# Laravel Client

Add hosted sign-in to an existing Laravel application with `users-au/laravel-client`. Check the repository for the supported PHP and Laravel versions of the release you install.

```sh
composer require users-au/laravel-client
php artisan vendor:publish --provider="Usersau\UsersauLaravelClient\UsersauLaravelClientServiceProvider"
php artisan migrate
```

Register a confidential OAuth client with the app's `/auth/usersau/callback` URL. Configure the `usersau` entry in `config/services.php` with the Client ID, Client secret, redirect URI and project host. Set `USERSAU_CLIENT_ID`, `USERSAU_CLIENT_SECRET`, `USERSAU_REDIRECT_URI` and `USERSAU_HOST` in private environment configuration. Follow the repository's model setup and keep token fields out of serialized responses.

Start sign-in with the package's `usersau.login` route. The package also provides `usersau.register`, `usersau.account` and `usersau.logout`. Test that local account linking, permissions and logout behave as expected.

Recent SDK versions can use [confidential PAR and application context](../guide/oauth-oidc.md#pushed-authorization-and-application-context). Check the installed release's defaults and the OAuth client's PAR setting before upgrading an existing integration.

[Installation and route reference](https://github.com/Users-au/laravel-client) · [Profile and preferences contract](https://github.com/Users-au/laravel-client/blob/main/docs/identity-preferences.md)
