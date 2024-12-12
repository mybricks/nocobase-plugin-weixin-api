/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var plugin_exports = {};
__export(plugin_exports, {
  WeixinApiServer: () => WeixinApiServer,
  default: () => plugin_default
});
module.exports = __toCommonJS(plugin_exports);
var import_server = require("@nocobase/server");
var import_actions = require("./actions");
var import_constants = require("../constants");
var import_weixin_auth = require("./weixin-auth");
class WeixinApiServer extends import_server.Plugin {
  async afterAdd() {
  }
  async beforeLoad() {
  }
  async load() {
    this.app.resource({
      name: import_constants.resourceKey,
      actions: {
        get: import_actions.getConfiguration,
        set: import_actions.setConfiguration
      },
      only: ["get", "set"]
    });
    this.app.authManager.registerTypes(import_constants.authType, {
      auth: import_weixin_auth.WeixinAuth,
      title: "\u5FAE\u4FE1\u5C0F\u7A0B\u5E8F"
    });
  }
  async install() {
  }
  async afterEnable() {
  }
  async afterDisable() {
  }
  async remove() {
  }
}
var plugin_default = WeixinApiServer;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WeixinApiServer
});
