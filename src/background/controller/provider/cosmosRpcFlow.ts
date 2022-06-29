import {
  keyringService,
  networkPreferenceService,
  notificationService,
  permissionService,
} from 'background/service';
import { PromiseFlow, underline2Camelcase } from 'background/utils';
import { JSONUint8Array } from 'utils/cosmos/json-uint8-array';
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
    if (Reflect.getMetadata('SkipConnect', cosmosController, mapMethod)) {
      return next();
    }
    if (!Reflect.getMetadata('SAFE', cosmosController, mapMethod)) {
      let chainId = args[0] || networkPreferenceService.getCurrentChainId();
      if (chainId.chainId) {
        chainId = chainId.chainId;
      }
      const provider = await networkPreferenceService.getCosmosChainInfo(
        chainId
      );
      if (!provider) {
        throw new Error(
          `chain id [${chainId}] doesn't has registed provider in wallet`
        );
      }
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
  // check need approval
  .use(async (ctx, next) => {
    const {
      request: {
        data: { args, id, method, type },
        session: { origin, name, icon },
      },
      mapMethod,
    } = ctx;
    const [approvalType, precheck] =
      Reflect.getMetadata('APPROVAL', cosmosController, mapMethod) || [];
    if (approvalType) {
      const existed = precheck && precheck(ctx.request);
      if (existed) {
        return next();
      }
      ctx.request.requestedApproval = true;
      console.log('====[args]===', args);
      ctx.approvalRes = await notificationService.requestApproval({
        approvalComponent: approvalType,
        params: {
          method,
          data: args,
          existed: existed,
          session: { origin, name, icon },
        },
        origin,
      });
      permissionService.touchConnectedSite(origin);
    }
    return next();
  })
  // process request
  .use(async (ctx) => {
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
  //request = JSONUint8Array.unwrap(request);
  const ctx: any = { request: { ...request, requestedApproval: false } };
  return flowContext(ctx).finally(() => {
    if (ctx.request.rejectApproval) {
      flow.requestedApproval = false;
    }
  });
};
