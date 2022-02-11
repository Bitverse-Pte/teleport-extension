import { ethErrors } from 'eth-rpc-errors';
import { tab } from 'background/webapi';
import { sessionService, keyringService } from 'background/service';

import rpcFlow from './rpcFlow';
import internalMethod from './internalMethod';

tab.on('tabRemove', (id) => {
  sessionService.deleteSession(id);
});

export default async (req) => {
  const {
    data: { method },
  } = req;
  //TODO for debug use, remove later...
  console.log('------------background provider controller:-------------', req);

  if (internalMethod[method]) {
    return internalMethod[method](req);
  }

  const hasSecret = keyringService.hasSecret();
  if (!hasSecret) {
    throw ethErrors.provider.userRejectedRequest({
      message: 'wallet must has at least one account',
    });
  }

  return rpcFlow(req);
};
