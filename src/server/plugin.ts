import { Plugin } from '@nocobase/server';
import { getConfiguration, setConfiguration } from './actions';
import { authType, resourceKey } from '../constants';
import { WeixinAuth } from './weixin-auth';

export class WeixinApiServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    this.app.resource({
      name: resourceKey,
      actions: {
        get: getConfiguration,
        set: setConfiguration,
      },
      only: ['get', 'set'],
    });

    this.app.authManager.registerTypes(authType, {
      auth: WeixinAuth,
      title: '微信小程序',
    });
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default WeixinApiServer;
