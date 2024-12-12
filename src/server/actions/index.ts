import { Context } from '@nocobase/actions';
import { resourceKey } from '../../constants';

export const getConfiguration = async (ctx: Context, next) => {
  const repo = ctx.db.getRepository(resourceKey);
  const record = await repo.findOne();
  ctx.body = record;
  return next();
};

export const setConfiguration = async (ctx: Context, next) => {
  const { params: values } = ctx.action;
  const repo = ctx.db.getRepository(resourceKey);
  const record = await repo.findOne();

  if (record) {
    await repo.update({
      values,
      filter: {
        id: record.id,
      },
    });
  } else {
    await repo.create({
      values,
    });
  }

  ctx.body = 'ok';
  return next();
};
