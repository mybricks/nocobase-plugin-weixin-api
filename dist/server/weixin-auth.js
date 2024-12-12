/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var weixin_auth_exports = {};
__export(weixin_auth_exports, {
  WeixinAuth: () => WeixinAuth
});
module.exports = __toCommonJS(weixin_auth_exports);
var import_axios = __toESM(require("axios"));
var import_auth = require("@nocobase/auth");
var import_constants2 = require("../constants");
class WeixinAuth extends import_auth.BaseAuth {
  constructor(config) {
    const { ctx } = config;
    super({
      ...config,
      userCollection: ctx.db.getCollection("users")
    });
  }
  async validate() {
    const ctx = this.ctx;
    let user;
    await (async () => {
      const {
        values: { code }
      } = ctx.action.params;
      if (!code) {
        throw new Error("\u672A\u4F20\u9012 code \u53C2\u6570");
      }
      const repo = ctx.db.getRepository(import_constants2.resourceKey);
      const config = await repo.findOne();
      if (!config) {
        throw new Error("\u672A\u914D\u7F6E\u5FAE\u4FE1\u5F00\u53D1\u8005ID");
      }
      let weixinUserInfo;
      try {
        weixinUserInfo = (await import_axios.default.get("https://api.weixin.qq.com/sns/jscode2session", {
          params: {
            appid: config.appid,
            secret: config.secret,
            js_code: code,
            grant_type: "authorization_code"
          }
        })).data;
        if (weixinUserInfo.errcode) {
          throw new Error(weixinUserInfo.errmsg);
        }
      } catch (err) {
        console.log(err);
        throw new Error(err.message);
      }
      try {
        const authenticator = this.authenticator;
        user = await authenticator.findOrCreateUser(weixinUserInfo.openid, {
          nickname: `\u5FAE\u4FE1\u7528\u6237-${weixinUserInfo.openid}`
        });
        if (!user) {
          throw new Error("\u7528\u6237\u521B\u5EFA\u5931\u8D25");
        }
      } catch (err) {
        console.log(err);
        throw new Error(err.message);
      }
    })();
    return user;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WeixinAuth
});
