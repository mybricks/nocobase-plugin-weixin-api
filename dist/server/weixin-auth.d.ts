import { AuthConfig, BaseAuth } from '@nocobase/auth';
import { Model } from '@nocobase/database';
export declare class WeixinAuth extends BaseAuth {
    constructor(config: AuthConfig);
    validate(): Promise<Model<any, any>>;
}
