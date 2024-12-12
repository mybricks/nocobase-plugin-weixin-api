import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'weixinConfiguration',
  fields: [
    { type: 'string', name: 'appid' },
    { type: 'string', name: 'secret' },
  ],
});
