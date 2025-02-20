import { Plugin } from '@nocobase/client';
import AuthPlugin from '@nocobase/plugin-auth/client';
import { Setting } from './Setting';
import { authType } from '../constants';
import { name } from '../../package.json';

export class WeixinApiClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    // 添加配置页面
    this.app.pluginSettingsManager.add(name, {
      title: '微信接口配置',
      icon: 'WechatOutlined',
      Component: Setting,
    });

    // 注册微信登录类型
    const auth = this.app.pm.get(AuthPlugin);
    // @ts-ignore
    auth.registerType(authType, {
      // @ts-ignore
      options: {},
    });
  }
}

export default WeixinApiClient;
