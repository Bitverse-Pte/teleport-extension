import { PromiseFlow } from 'background/utils';

const flow = new PromiseFlow();

const flowContext = flow
  .use(async (ctx, next) => {
    console.log('====>>>>>');
    return next();
  })
  .callback();

export default (request) => {
  const ctx: any = { request: { ...request, requestedApproval: false } };
  return flowContext(ctx).finally(() => {
    if (ctx.request.rejectApproval) {
      flow.requestedApproval = false;
    }
  });
};
