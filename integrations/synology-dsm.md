# Sign in to Synology DSM with Users.au (OpenID Connect)

[中文](synology-dsm.zh-CN.md)

This guide connects Synology DSM's **SSO Client** to your Users.au project so people sign in to the NAS with their Users.au account. It also lists the errors you are likely to see and what each one means.

## How it works

1. DSM sends the browser to your Users.au project with an authorization request (it includes a `nonce`).
2. The person signs in to Users.au and is sent back to DSM.
3. DSM exchanges the code at `/oauth/token`, validates the **ID token**, then calls the UserInfo endpoint.
4. DSM reads the **username claim** (`preferred_username`) and signs the person in to the **existing** DSM account with exactly that name. DSM does not create accounts.

## Before you start

- A DSM account must already exist for each person. DSM account names cannot contain `@`, so an email address can never match one.
- Don't use DSM's built-in `admin` account for SSO. DSM 7 disables it by default, and SSO sign-in to it fails with "no privilege". Use a personal account that is allowed to use DSM.
- Use the address people actually use to open DSM, for example `https://nas.example.com:5001`. DSM sends this address back to Users.au exactly as you type it.

## 1. Users.au: create the application

In your project's admin, open **Connected applications (OAuth)** and create a client:

- **Name**: for example `Synology DSM`
- **Redirect URI**: the DSM address, for example `https://nas.example.com:5001`. It must match the DSM setting **character for character** (scheme, host, port, trailing slash).

Keep the Client ID and Client secret. The secret is shown only once.

## 2. Users.au: collect the username, and lock it

DSM matches people by `preferred_username`. Users.au sends it only when your project collects it.

1. Open **Profile collection**, turn on **Preferred username**, and under it turn on **Only administrators can change**. Save.
2. For each person, open their user page, choose **Edit profile**, and in **Administrator-managed profile** set **Preferred username** to their DSM account name.

> **Security:** do not skip "Only administrators can change". If people can edit their own preferred username, anyone with a Users.au account in your project can set it to someone else's DSM account name, including an administrator's, and sign in as them. Values people saved before you turned on the lock stay as they are, so review them.

When the lock is on and a person has no preferred username yet, Users.au sends their numeric user ID instead. It never falls back to a nickname the person chose.

## 3. DSM: configure the SSO client

**Control Panel → Domain/LDAP → SSO Client**, enable **OpenID Connect SSO service**, then open its settings:

| DSM field | Value |
| --- | --- |
| Profile | `OIDC` |
| Account type | **Local** for normal DSM accounts. Choose **Domain/LDAP** only if the NAS is joined to a domain or LDAP directory and the accounts live there. |
| Name | Any label, for example `Users`. It appears on the DSM sign-in page as "Continue with Users". |
| Well-known URL | `https://<your-project-domain>/.well-known/openid-configuration` |
| Application ID | Client ID from step 1 |
| Application secret | Client secret from step 1 |
| Redirect URI | The same address you registered in step 1 |
| Authorization scope | `openid profile email` |
| Username claim | `preferred_username` |

Save, then sign out of DSM and use **SSO** → **Continue with …** on the sign-in page.

## Troubleshooting

| What you see | Where | Cause and fix |
| --- | --- | --- |
| Error before or instead of the Users.au sign-in page, `invalid_client` | Users.au | The redirect URI DSM sent doesn't match the registered one. Compare them character for character. To see what DSM sends, open the Users.au sign-in page from DSM and read `redirect_uri=` in the address bar. |
| "SSO configuration error" after signing in | DSM | DSM rejected the token response. DSM requires an ID token; Users.au issues one for the `openid` scope. Check that the scope includes `openid` and the Client secret is correct. |
| "The account or password you entered is incorrect" after signing in | DSM | DSM found no matching account. Check, in order: **Account type** is **Local** for local accounts; the username claim is `preferred_username` (Users.au never sends a claim named `username`); Profile collection has Preferred username on; the person's preferred username exactly equals an existing DSM account name. |
| "No privilege" | DSM | The account matched, but DSM won't let it sign in: it is disabled (for example the built-in `admin`), or its application permission for DSM is set to deny. Use an enabled personal account that is allowed to use DSM. |

When you share a callback address while troubleshooting, hide the value after `code=`. It is a one-time sign-in code.

## Lessons from setting this up

- **Read the request, not the error.** DSM shows the same few messages for very different problems. The Users.au access log tells you which step failed: no `/oauth/token` call means the redirect failed; a token call without a following UserInfo call means DSM rejected the token (for example a missing ID token); both calls succeeding means the problem is account matching inside DSM.
- **DSM checks the ID token before it reads UserInfo.** An OIDC provider that only serves UserInfo is not enough for DSM.
- **The username claim must be a value a DSM account can have.** `email` contains `@`, and `sub` is a numeric ID, so neither matches a DSM account. Use `preferred_username`.
- **A claim used to sign people in to another system must be administrator-managed.** Otherwise anyone can claim another person's account.
- **Account type matters.** With Domain/LDAP selected, DSM looks only in the directory, so a correct username for a local account still fails.
- **Don't use the built-in `admin` account.** It is usually disabled, and SSO to it reports "no privilege".
