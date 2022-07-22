import { ethErrors } from 'eth-rpc-errors';
import { tab } from 'background/webapi';
import {
  sessionService,
  keyringService,
  preferenceService,
} from 'background/service';

import rpcFlow from './rpcFlow';
import internalMethod from './internalMethod';
import cosmosRpcFlow from './cosmosRpcFlow';

tab.on('tabRemove', (id) => {
  sessionService.deleteSession(id);
});

export default async (req) => {
  const {
    data: { method, type },
  } = req;
  //TODO for debug use, remove later...
  if (internalMethod[method]) {
    return internalMethod[method](req);
  }
  const hasSecret = keyringService.hasSecret();
  if (!hasSecret) {
    throw ethErrors.provider.userRejectedRequest({
      message: 'wallet must has at least one account',
    });
  }

  if (type && type === 'cosmos-proxy-request') {
    return cosmosRpcFlow(req);
  }

  return rpcFlow(req);
};
