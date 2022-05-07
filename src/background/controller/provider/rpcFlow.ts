import { ethErrors } from 'eth-rpc-errors';
import {
  keyringService,
  networkPreferenceService,
  notificationService,
  permissionService,
  preferenceService,
  txController,
} from 'background/service';
import { PromiseFlow, underline2Camelcase } from 'background/utils';
import { EVENTS } from 'constants/index';
import providerController from './controller';
import eventBus from 'eventBus';
import { TransactionEnvelopeTypes } from 'constants/transaction';
import TransactionController from 'background/service/transactions';
import { clone, cloneDeep } from 'lodash';

const isSignApproval = (type: string) => {
  const SIGN_APPROVALS = ['SignText', 'SignTypedData', 'SignTx'];
  return SIGN_APPROVALS.includes(type);
};

const flow = new PromiseFlow();
const flowContext = flow
  .use(async (ctx, next) => {
    // check method
    const {
      data: { method },
    } = ctx.request;
    ctx.mapMethod = underline2Camelcase(method);

    if (!providerController[ctx.mapMethod]) {
      if (method.startsWith('eth_')) {
        return providerController.ethRpc(ctx.request);
      }

      throw ethErrors.rpc.methodNotFound({
        message: `method [${method}] doesn't has corresponding handler`,
        data: ctx.request.data,
      });
    }

    return next();
  })
  .use(async (ctx, next) => {
    const { mapMethod } = ctx;
    if (!Reflect.getMetadata('SAFE', providerController, mapMethod)) {
      // check lock
      const isUnlock = keyringService.getIsUnlocked();

      if (!isUnlock) {
        ctx.request.requestedApproval = true;
        await notificationService.requestApproval({ lock: true });
      }
    }

    return next();
  })
  .use(async (ctx, next) => {
    // check connect
    const {
      request: {
        session: { origin, name, icon },
      },
      mapMethod,
    } = ctx;
    const account = preferenceService.getCurrentAccount();
    if (!Reflect.getMetadata('SAFE', providerController, mapMethod)) {
      if (!permissionService.hasPerssmion(origin, account?.address)) {
        ctx.request.requestedApproval = true;
        const { defaultChain } = await notificationService.requestApproval({
          params: { origin, name, icon },
          approvalComponent: 'Connect',
        });
        permissionService.addConnectedSite(
          origin,
          name,
          icon,
          defaultChain,
          false,
          account?.address
        );
      }
    }

    return next();
  })
  .use(async (ctx, next) => {
    // check need approval
    const {
      request: {
        data: { params, method },
        session: { origin, name, icon },
      },
      mapMethod,
    } = ctx;
    const [approvalType, condition] =
      Reflect.getMetadata('APPROVAL', providerController, mapMethod) || [];
    if (approvalType && (!condition || !condition(ctx.request))) {
      ctx.request.requestedApproval = true;
      // fix the request param from dapp, should compatiable with send from app.
      if (approvalType === 'SignTx' && !params[0].txParam) {
        if (!params[0].type) {
          params[0].type =
            (await networkPreferenceService.getEIP1559Compatibility())
              ? TransactionEnvelopeTypes.FEE_MARKET
              : TransactionEnvelopeTypes.LEGACY;
        }
        // the .txParam is used for display origin info in SignTx page
        params[0].txParam = {
          from: params[0].from,
          to: params[0].to,
          value: params[0].value,
          type: params[0].type,
        };
        if (!params[0].gas) {
          const txMeta = cloneDeep(params[0]);
          txMeta.txParams = {
            from: txMeta.from,
            to: txMeta.to,
            value: txMeta.value,
            type: txMeta.type,
            data: txMeta.data,
          };
          delete txMeta.txParam;
          const { gasLimit: defaultGasLimit } =
            await txController._getDefaultGasLimit(txMeta, '0x0');
          console.info(
            'no gas set from dapp, generated default gas limit:',
            defaultGasLimit
          );
          if (defaultGasLimit) {
            params[0].gas = defaultGasLimit;
            params[0].txParam.gas = defaultGasLimit;
          }
        }
      }
      ctx.approvalRes = await notificationService.requestApproval({
        approvalComponent: approvalType,
        params: {
          method,
          data: params,
          session: { origin, name, icon },
        },
        origin,
      });

      if (isSignApproval(approvalType)) {
        permissionService.updateConnectSite(origin, { isSigned: true }, true);
      } else {
        permissionService.touchConnectedSite(origin);
      }
    }

    return next();
  })
  .use(async (ctx) => {
    const { approvalRes, mapMethod, request } = ctx;
    // process request
    const [approvalType] =
      Reflect.getMetadata('APPROVAL', providerController, mapMethod) || [];
    const { uiRequestComponent, ...rest } = approvalRes || {};
    const {
      session: { origin },
    } = request;
    const requestDefer = Promise.resolve(
      providerController[mapMethod]({
        ...request,
        approvalRes,
      })
    );

    requestDefer
      .then((result) => {
        if (isSignApproval(approvalType)) {
          eventBus.emit(EVENTS.broadcastToUI, {
            method: EVENTS.SIGN_FINISHED,
            params: {
              success: true,
              data: result,
            },
          });
        }
        return result;
      })
      .catch((e: any) => {
        if (isSignApproval(approvalType)) {
          eventBus.emit(EVENTS.broadcastToUI, {
            method: EVENTS.SIGN_FINISHED,
            params: {
              success: false,
              errorMsg: JSON.stringify(e),
            },
          });
        }
      });

    if (uiRequestComponent) {
      ctx.request.requestedApproval = true;
      return await notificationService.requestApproval({
        approvalComponent: uiRequestComponent,
        params: rest,
        origin,
        approvalType,
      });
    }

    return requestDefer;
  })
  .callback();

export default (request) => {
  const ctx: any = { request: { ...request, requestedApproval: false } };
  return flowContext(ctx).finally(() => {
    if (ctx.request.requestedApproval) {
      flow.requestedApproval = false;
      // only unlock notification if current flow is an approval flow
      notificationService.unLock();
    }
  });
};
