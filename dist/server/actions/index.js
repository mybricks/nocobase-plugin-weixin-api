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
var actions_exports = {};
__export(actions_exports, {
  getConfiguration: () => getConfiguration,
  setConfiguration: () => setConfiguration
});
module.exports = __toCommonJS(actions_exports);
var import_constants = require("../../constants");
const getConfiguration = async (ctx, next) => {
  const repo = ctx.db.getRepository(import_constants.resourceKey);
  const record = await repo.findOne();
  ctx.body = record;
  return next();
};
const setConfiguration = async (ctx, next) => {
  const { params: values } = ctx.action;
  const repo = ctx.db.getRepository(import_constants.resourceKey);
  const record = await repo.findOne();
  if (record) {
    await repo.update({
      values,
      filter: {
        id: record.id
      }
    });
  } else {
    await repo.create({
      values
    });
  }
  ctx.body = "ok";
  return next();
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getConfiguration,
  setConfiguration
});
