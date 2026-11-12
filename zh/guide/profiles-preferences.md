# 资料与界面偏好

UserInfo 根据 Access Token 的 scope 和项目收集的资料字段返回身份信息。本地账户使用签发方和 `sub` 作为身份标识。邮箱、昵称和首选用户名都可能变更。

## 声明与 scope

| Scope | 用途 |
| --- | --- |
| `openid` | OIDC 登录，交换授权码时获取 ID Token。 |
| `profile` | 姓名、头像和项目收集的资料声明，例如已收集的 `preferred_username`。 |
| `email` | `email` 和 `email_verified`。 |
| `phone`、`address` | 返回已收集的对应声明。 |
| `preferences:read` | 通过 UserInfo 的 `urn:usersau:preferences` 声明或偏好 API 读取界面偏好。 |
| `preferences:write` | 通过偏好 API 更新受支持的偏好。 |

## 管理员维护的资料字段

在**资料收集**中启用所需字段。如果某个字段用于控制其他系统的访问，勾选**仅管理员可修改**。启用限制时检查已有值。管理员可以打开对应用户记录编辑字段。例如，[Synology DSM](../integrations/synology-dsm.md) 用 `preferred_username` 匹配本地账户，因此该字段应由管理员维护。

## 同步语言、时区和主题

账户偏好随已登录的 Users.au 账户同步。使用 Bearer Access Token 请求 `GET /api/interface-preferences` 读取当前快照。启用回写时，通过 `PATCH /api/interface-preferences` 将读取时的版本作为 `expected_version`，并提交变更。遇到冲突先读取最新快照并处理差异，再重试。改变 scope 后重新授权，获取更新后的授权凭据。

版本协议和 Token 存储要求参见 [Frontend Client](../integrations/frontend-client.md)、[Laravel Client](../integrations/laravel-client.md) 或 [Next.js Starter Kit](../integrations/nextjs-starter-kit.md)。
