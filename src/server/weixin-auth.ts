import axios from 'axios';
import { AuthConfig, BaseAuth } from '@nocobase/auth';
import { Model } from '@nocobase/database';
import { AuthModel } from '@nocobase/plugin-auth';
import { namespace } from '../constants';
import { resourceKey } from '../constants';

export class WeixinAuth extends BaseAuth {
  constructor(config: AuthConfig) {
    const { ctx } = config;
    super({
      ...config,
      userCollection: ctx.db.getCollection('users'),
    });
  }

  async validate() {
    const ctx = this.ctx;
    let user: Model;

    // 使用微信 code 获取 opennId
    await (async () => {
      const {
        values: { code },
      } = ctx.action.params;

      if (!code) {
        throw new Error('未传递 code 参数');
      }

      const repo = ctx.db.getRepository(resourceKey);
      const config = await repo.findOne();

      if (!config) {
        throw new Error('未配置微信开发者ID');
      }

      let weixinUserInfo: any;
      try {
        // 获取 openId
        weixinUserInfo = (
          await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
              appid: config.appid,
              secret: config.secret,
              js_code: code,
              grant_type: 'authorization_code',
            },
          })
        ).data;

        if (weixinUserInfo.errcode) {
          throw new Error(weixinUserInfo.errmsg);
        }
      } catch (err) {
        console.log(err);
        throw new Error(err.message);
      }

      try {
        const authenticator = this.authenticator as AuthModel;

        // 查找或创建用户
        user = await authenticator.findUser(weixinUserInfo.openid);
        if (!user) {
          // 创建新用户
          user = await authenticator.newUser(weixinUserInfo.openid, {
            nickname: `微信用户-${weixinUserInfo.openid}`,
          });
          
          // 只在首次创建时记录 meta 信息
          const db = this.ctx.db;
          await db.getRepository('usersAuthenticators').update({
            filter: {
              authenticator: authenticator.name,
              userId: user.id,
            },
            values: {
              meta: weixinUserInfo,
            },
          });
        }

        if (!user) {
          throw new Error('用户创建失败');
        }
      } catch (err) {
        console.log(err);
        throw new Error(err.message);
      }
    })();

    return user;
  }
}
