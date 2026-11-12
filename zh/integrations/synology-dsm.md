# 用 Users.au 登录 Synology DSM（OpenID Connect）

[English](../../integrations/synology-dsm.md)

本指南把 Synology DSM 的 **SSO 客户端**接入你的 Users.au 项目，让用户用 Users.au 账号登录 NAS，并列出常见报错及其含义。

## 工作原理

1. DSM 把浏览器转到你的 Users.au 项目，发起授权请求（带 `nonce`）。
2. 用户登录 Users.au 后被转回 DSM。
3. DSM 在 `/oauth/token` 用授权码换取令牌，校验 **ID token**，再调用 UserInfo 接口。
4. DSM 读取**用户名声明**（`preferred_username`），登录名称与之完全相同的**已有** DSM 账户。DSM 不会自动创建账户。

## 准备工作

- 每个用户都要先有 DSM 账户。DSM 账户名不能包含 `@`，所以邮箱地址永远匹配不上。
- 不要用 DSM 内置的 `admin` 账户走 SSO。DSM 7 默认停用它，用 SSO 登录会提示“no privilege”。请使用允许使用 DSM 的个人账户。
- 使用大家实际打开 DSM 的地址，例如 `https://nas.example.com:5001`。DSM 会把这个地址原样回传给 Users.au。

## 1. Users.au：创建应用

在项目后台打开 **应用接入（OAuth）**，新建客户端：

- **名称**：例如 `Synology DSM`
- **回调地址**：DSM 的地址，例如 `https://nas.example.com:5001`。必须与 DSM 里的设置**逐字符一致**（协议、主机、端口、末尾斜杠）。

记下 Client ID 和 Client Secret。密钥只显示一次。

## 2. Users.au：收集并锁定用户名

DSM 按 `preferred_username` 匹配用户。只有项目开启收集时，Users.au 才会返回它。

1. 打开 **资料收集**，开启 **首选用户名**，并勾选它下方的 **仅管理员可修改**，保存。
2. 逐个打开用户页面，点 **编辑资料**，在 **管理员管理的资料** 中把 **首选用户名** 设为该用户的 DSM 账户名。

> **安全提示：** 一定要开启“仅管理员可修改”。如果用户能自己修改首选用户名，项目里任何 Users.au 用户都能把它改成别人的 DSM 账户名（包括管理员的），然后以对方身份登录。开启锁定前用户已保存的值会保留，请逐一检查。

开启锁定后，如果某个用户还没有首选用户名，Users.au 会改为发送他的数字用户 ID，绝不会退回用户自己设的昵称。

## 3. DSM：配置 SSO 客户端

**控制面板 → 域/LDAP → SSO 客户端**，启用 **OpenID Connect SSO 服务**，打开其设置：

| DSM 字段 | 填写 |
| --- | --- |
| 配置文件 | `OIDC` |
| 帐户类型 | 普通 DSM 账户选 **本地**。只有 NAS 已加入域或 LDAP、账户存放在目录里时才选 **域/LDAP**。 |
| 名称 | 任意标签，例如 `Users`，登录页会显示“使用 Users 继续”。 |
| Well-known URL | `https://<你的项目域名>/.well-known/openid-configuration` |
| 应用程序 ID | 第 1 步的 Client ID |
| 应用程序密钥 | 第 1 步的 Client Secret |
| 重定向 URI | 与第 1 步登记的地址相同 |
| 授权范围 | `openid profile email` |
| 用户名声明 | `preferred_username` |

保存后退出 DSM，在登录页选 **SSO 验证** → **使用 … 继续**。

## 故障排查

| 现象 | 出现位置 | 原因与处理 |
| --- | --- | --- |
| 看不到 Users.au 登录页，或提示 `invalid_client` | Users.au | DSM 发送的回调地址与登记的不一致。逐字符核对。想看 DSM 实际发送的值：从 DSM 打开 Users.au 登录页，查看地址栏里 `redirect_uri=` 后面的内容。 |
| 登录后提示“SSO 配置错误” | DSM | DSM 拒绝了令牌响应。DSM 要求 ID token，Users.au 会在授权范围包含 `openid` 时签发。确认授权范围包含 `openid`，且应用程序密钥正确。 |
| 登录后提示“所输入之账号或密码错误” | DSM | DSM 找不到匹配的账户。依次检查：本地账户的 **帐户类型** 选的是 **本地**；用户名声明是 `preferred_username`（Users.au 不会返回名为 `username` 的声明）；资料收集已开启首选用户名；该用户的首选用户名与已有 DSM 账户名完全一致。 |
| 提示“no privilege” | DSM | 账户匹配上了，但 DSM 不允许它登录：账户已停用（例如内置 `admin`），或其 DSM 应用程序权限被设为拒绝。请使用已启用且允许使用 DSM 的个人账户。 |

排查时如需分享回调地址，请把 `code=` 后面的值打码，那是一次性登录码。

## 本次接入的经验

- **看请求，别只看报错。** DSM 对完全不同的问题只显示寥寥几种提示。Users.au 的访问日志能告诉你卡在哪一步：没有 `/oauth/token` 请求，说明回调失败；有令牌请求但之后没有 UserInfo 请求，说明 DSM 拒绝了令牌（例如缺少 ID token）；两者都成功，说明问题在 DSM 内部的账户匹配。
- **DSM 先校验 ID token，再读取 UserInfo。** 只提供 UserInfo 的 OIDC 服务满足不了 DSM。
- **用户名声明的值必须能成为 DSM 账户名。** `email` 含 `@`，`sub` 是数字 ID，都匹配不上 DSM 账户，请用 `preferred_username`。
- **用于登录其他系统的声明必须由管理员管理。** 否则任何人都能冒认别人的账户。
- **帐户类型很关键。** 选了“域/LDAP”，DSM 只在目录里查找，即使本地账户的用户名正确也会失败。
- **不要用内置 `admin` 账户。** 它通常已被停用，用 SSO 登录会提示“no privilege”。
