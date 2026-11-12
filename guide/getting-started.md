# Get started

Users.au hosts sign-in and account management for your project. Your application redirects people to that project, then opens its own session and applies its own access rules.

## Create a project and register your app

1. Open the [Users.au console](https://my.users.au/) and create or select a project. Note the project's sign-in origin, for example `https://identity.example.com`. Use the same origin throughout the integration.
2. In the project admin, open **Connected applications (OAuth)** and register your application. For sign-in, use the authorization-code flow. Use a **public** client for a browser-only application or a **confidential** client when a trusted backend handles the exchange.
3. Register the exact callback URL from your integration guide. For example, `http://localhost:3000/auth/usersau/callback` for the Next.js starter in development and `https://app.example.com/auth/usersau/callback` for its production deployment. Register each environment's URL explicitly.
4. Copy the Client ID to the app configuration. If the client has a secret, save it in your backend's secret store when it is displayed. Keep it out of browser bundles and version control.
5. [Choose an integration](../integrations/index.md) and start sign-in from the application.

## Verify before launch

- Test a successful sign-in, a cancelled sign-in and a rejected callback.
- Test membership and role checks in your application after sign-in. Use the provider issuer and subject together to identify the account.
- Check logout in both the application and the hosted account. Test the return link separately from the OAuth callback.
- For browser clients, configure the application origin for cross-origin token and UserInfo calls. Compare the scheme, hostname and port when diagnosing a failure.
- Test the [project sign-in and recovery settings](project-admin.md) with a separate browser session.
