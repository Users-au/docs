# Laravel Socialite

Use `users-au/socialite-provider` when your Laravel app already owns its sign-in controllers and user model.

```sh
composer require users-au/socialite-provider
```

1. In `config/services.php`, add a `usersau` entry with `client_id`, `client_secret`, `redirect` and `host`. Use the Users.au project origin as `host` and register your application's exact callback as `redirect`.
2. Register the provider's `SocialiteWasCalled` listener using the instructions for your Laravel version.
3. Start sign-in with `Socialite::driver('usersau')->redirect()`. Use `Socialite::driver('usersau')->user()` from your callback to obtain the profile with state validation.
4. Link to a local account by the issuer and provider subject. Apply local membership and permissions before opening a session.

Provider 2 uses the standard `sub` as the Socialite ID, maps the avatar from `picture` and exposes granted claims through `getRaw()`. Optional claims can be absent. Keep the client secret on the server.

[Provider setup and user fields](https://github.com/Users-au/socialite-provider) · [SocialiteProviders installation](https://socialiteproviders.com/usage/)
