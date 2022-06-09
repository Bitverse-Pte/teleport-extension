import {
  keyringService,
  networkPreferenceService,
  notificationService,
  permissionService,
} from 'background/service';
import { PromiseFlow, underline2Camelcase } from 'background/utils';
import cosmosController from './cosmosController';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isSignApproval = (type: string) => {
  const SIGN_APPROVALS = ['SignCosmosTx', 'SignTx'];
  return SIGN_APPROVALS.includes(type);
};

const flow = new PromiseFlow();
const flowContext = flow
  //check method
  .use(async (ctx, next) => {
    const {
      data: { method },
    } = ctx.request;
    ctx.mapMethod = underline2Camelcase(method);
    if (!cosmosController[ctx.mapMethod]) {
      throw new Error(`method [${method}] doesn't has corresponding handler`);
    }
    return next();
  })
  // check lock
  .use(async (ctx, next) => {
    const { mapMethod } = ctx;
    if (!Reflect.getMetadata('SAFE', cosmosController, mapMethod)) {
      const isUnlock = keyringService.getIsUnlocked();
      if (!isUnlock) {
        ctx.request.requestedApproval = true;
        await notificationService.requestApproval({ lock: true });
      }
    }
    return next();
  })
  // check connect
  .use(async (ctx, next) => {
    const {
      request: {
        session: { origin, name, icon },
        data: { args, id, method, type },
      },
      mapMethod,
    } = ctx;
    const chainId = args[0];
    const provider = await networkPreferenceService.getCosmosChainInfo(chainId);
    console.log('====provider====', provider);
    console.log('====[chainId, mapMethod]===', chainId, mapMethod);
    if (!Reflect.getMetadata('SAFE', cosmosController, mapMethod)) {
      if (
        !permissionService.hasPerssmion({ origin: origin, chainId: chainId })
      ) {
        ctx.request.requestedApproval = true;
        await notificationService.requestApproval({
          params: { origin, name, icon, chainId },
          approvalComponent: 'Connect4Cosmos',
        });
        permissionService.addConnectedSite4CosmosNetwork(
          origin,
          name,
          icon,
          chainId
        );
      }
    }
    return next();
  })
  .use(async (ctx, next) => {
    const { approvalRes, mapMethod, request } = ctx;
    const [approvalType] =
      Reflect.getMetadata('APPROVAL', cosmosController, mapMethod) || [];
    const {
      session: { origin },
    } = request;
    const requestDefer = Promise.resolve(
      cosmosController[mapMethod]({
        ...request,
        approvalRes,
      })
    );
    requestDefer.then((result) => {
      return result;
    });

    return requestDefer;
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
