# Project administration

Sign-in settings apply to the Users.au project. Test each enabled path with a regular account in a separate browser session before requiring it for everyone.

## Sign-in and account access

| Area | What to configure |
| --- | --- |
| Login flow | Choose whether people enter their identifier and password together or enter their identifier first. Check which passwordless and passkey options are compatible with the selected flow. |
| Passwordless and passkeys | Enable email verification codes and passkeys according to the project's policy. Test code delivery, passkey enrollment, and the fallback available on a new device. |
| Social login | Configure the providers you want to offer and register the provider callback on your Users.au project domain. Test first sign-in and existing-account linking. |
| Multi-factor authentication | Configure the additional verification step separately from the initial sign-in method. Two codes delivered to the same mailbox still depend on the same mailbox. |
| Registration and recovery | Check who can register, what users must verify, and how they recover access. Exercise each flow from an unauthenticated browser. |
| CAPTCHA | Configure the provider and the actions it protects. Test it on the project domain before requiring it. |

## Sessions and account access

The project session timeout is configured in minutes. It controls the hosted Users.au session. The connected application's session and OAuth token lifetime have their own settings. Test what happens when the hosted session expires while an application session is still open.

In the user admin area you can manage accounts and inspect sign-in activity. Use [Profile collection](profiles-preferences.md) to choose which optional identity fields to collect and which ones administrators control.

## Appearance and return links

Set project branding and test the hosted sign-in and account pages. Use the same project origin for discovery, token exchange and UserInfo. Confirm all registered callbacks and passkey enrolment when changing domains.

Applications that use [confidential PAR](oauth-oidc.md#pushed-authorization-and-application-context) can supply their own branding and return links from the backend. Set the project's default sign-in return URL to an application entry point that **starts** sign-in, such as `/auth/usersau/redirect` when the integration provides it. The OAuth callback completes sign-in and expects a code and matching state.
