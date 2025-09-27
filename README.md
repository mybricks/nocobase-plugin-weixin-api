
## 认证流程

### 1. 微信小程序认证机制

插件通过以下步骤实现微信小程序用户认证：

1. **获取微信 Code**：小程序端调用 `wx.login()` 获取临时登录凭证 `code`
2. **服务端验证**：使用 `code` 调用微信 API 获取用户 `openid`
3. **用户查找/创建**：基于 `openid` 查找现有用户或创建新用户
4. **返回认证结果**：返回用户信息和访问令牌

### 2. 核心认证逻辑

认证的核心实现在 `src/server/weixin-auth.ts` 文件中：

```typescript
// 调用微信 jscode2session 接口
const weixinUserInfo = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
  params: {
    appid: config.appid,
    secret: config.secret,
    js_code: code,
    grant_type: 'authorization_code',
  },
});

// 查找或创建用户
user = await authenticator.findOrCreateUser(weixinUserInfo.openid, {
  nickname: `微信用户-${weixinUserInfo.openid}`,
});
```

## 数据表设计

### 1. 微信配置表 (weixinConfiguration)

定义在 `src/server/collections/weixin.ts`：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| appid | string | 微信小程序 AppID |
| secret | string | 微信小程序 AppSecret |

### 2. 用户认证关联表 (usersAuthenticators)

NocoBase 核心表，用于存储用户与认证器的关联关系：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| uuid | string | 微信用户 OpenID |
| nickname | string | 用户昵称 |
| avatar | string | 用户头像 |
| meta | json | 认证方法的元数据，存储微信用户的完整信息 |
| authenticator | string | 认证器名称 |
| userId | bigInt | 关联的用户ID |

## 用户管理机制

### 1. 新用户注册

当微信用户首次登录时：

1. 系统调用 `findOrCreateUser` 方法（位于 NocoBase 核心认证模块）
2. 在 `usersAuthenticators` 表中查找是否存在对应的 `openid`
3. 如果不存在，创建新的用户记录和关联记录
4. 设置默认昵称为 `微信用户-{openid}`

### 2. 已注册用户登录

对于已注册用户：

1. 通过 `openid` 在 `usersAuthenticators` 表中查找用户
2. 返回对应的用户信息
3. 生成访问令牌

核心查找逻辑在 NocoBase 认证模块的 `findUser` 方法中实现。

## 配置管理

### 1. 后端配置接口

`src/server/actions/index.ts` 提供了配置管理接口：

- `getConfiguration`: 获取当前微信配置
- `setConfiguration`: 设置微信 AppID 和 AppSecret

### 2. 前端配置界面

`src/client/Setting.tsx` 提供了管理界面，管理员可以配置：

- **AppID**: 微信小程序ID
- **AppSecret**: 微信小程序密钥

## 插件注册

在 `src/server/plugin.ts` 中，插件向 NocoBase 注册认证类型：

```typescript
this.app.authManager.registerTypes(authType, {
  auth: WeixinAuth,
  title: '微信小程序',
});
```

同时注册配置管理的资源接口：

```typescript
this.app.resource({
  name: resourceKey,
  actions: {
    get: getConfiguration,
    set: setConfiguration,
  },
  only: ['get', 'set'],
});
```

## 使用方法

### 1. 安装插件

在 NocoBase 管理界面中启用 `@mybricks/weixin-api` 插件。

### 2. 配置微信参数

1. 进入插件设置页面
2. 填入微信小程序的 AppID 和 AppSecret
3. 保存配置

### 3. 小程序端集成

在微信小程序中调用登录接口：

```javascript
// 获取登录凭证
wx.login({
  success: (res) => {
    if (res.code) {
      // 发送 code 到 NocoBase 服务端
      wx.request({
        url: 'https://your-nocobase-domain/api/auth:signIn',
        method: 'POST',
        header: {
          'X-Authenticator': 'weixin'
        },
        data: {
          code: res.code
        },
        success: (authRes) => {
          // 处理登录结果
          console.log('登录成功', authRes.data);
        }
      });
    }
  }
});
```

## 技术依赖

- **NocoBase**: 基础框架
- **@nocobase/auth**: 认证框架
- **@nocobase/server**: 服务端核心
- **@nocobase/client**: 客户端核心
- **axios**: HTTP 请求库

## 用户创建机制

### 认证流程

1. **用户查找**: 首先通过 `openId` 在 `usersAuthenticators` 表中查找是否存在关联的用户
2. **用户创建**: 如果用户不存在，则创建新用户并建立认证关联
3. **信息记录**: 只在首次创建用户时记录微信用户信息到 `meta` 字段，后续登录直接使用已有关联

### 数据存储

- **users 表**: 存储基本用户信息（id, nickname 等）
- **usersAuthenticators 表**: 存储认证关联信息
  - `uuid`: 微信用户的 openId
  - `nickname`: 显示名称（格式：`微信用户-{openId}`）
  - `avatar`: 用户头像（可选）
  - `meta`: 完整的微信用户信息（JSON 格式）

### 代码实现

```typescript
// 查找或创建用户
let user = await authenticator.findUser(openId);
if (!user) {
  // 创建新用户
  user = await authenticator.newUser(openId, {
    nickname: `微信用户-${weixinUserInfo.openid}`,
  });
  
  // 只在首次创建时记录 meta 信息
  const db = this.ctx.db;
  await db.getRepository('usersAuthenticators').update({
    filter: {
      authenticator: authenticator.name,  // 注意：使用 name 而不是 id
      userId: user.id,
    },
    values: {
      meta: weixinUserInfo,
    },
  });
}
```

## 重要说明

### 数据库字段类型注意事项

在操作 `usersAuthenticators` 表时，需要注意 `authenticator` 字段的类型：

- **正确**: 使用 `authenticator.name`（字符串类型）
- **错误**: 使用 `authenticator.id`（整数类型）

这是因为在 `authenticators` 表的关联定义中，`sourceKey` 设置为 `'name'`，所以 `usersAuthenticators` 表中的 `authenticator` 字段存储的是认证器的名称而不是 ID。

```typescript
// 正确的写法
filter: {
  authenticator: authenticator.name,  // 字符串类型
  userId: user.id,
}

// 错误的写法（会导致 PostgreSQL 类型匹配错误）
filter: {
  authenticator: authenticator.id,    // 整数类型
  userId: user.id,
}
```

## 安全考虑

1. **AppSecret 保护**: 微信 AppSecret 应妥善保管，不要暴露在客户端代码中
2. **Code 时效性**: 微信 `code` 具有时效性，应及时使用
3. **OpenID 唯一性**: 基于 OpenID 进行用户识别，确保用户身份的唯一性

## 开发说明

### 常量定义

`src/constants.ts` 定义了插件使用的常量：

```typescript
export const authType = 'weixin';           // 认证类型标识
export const namespace = name;              // 插件命名空间
export const resourceKey = 'weixinConfiguration'; // 配置资源键
```

### 国际化支持

插件支持中英文国际化，配置文件位于：
- `src/locale/zh-CN.json`: 中文配置
- `src/locale/en-US.json`: 英文配置

## 版本信息

当前版本：1.8.0

## 许可证

AGPL-3.0

## 相关链接

- [官方文档](https://docs.mybricks.world/docs/miniprogram/common-scenarios/connect-nocobase)
- [NocoBase 官网](https://www.nocobase.com/)