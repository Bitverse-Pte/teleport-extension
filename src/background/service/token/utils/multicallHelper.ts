import { MulticallV2ABI } from 'constants/evm/multicall';
import { BigNumber, Contract, utils } from 'ethers';
import HumanStandardTokenABI from 'utils/human-standard-token-abi-extended';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Token } from 'types/token';

type MulticallV2Result = {
  returnData: string;
  success: boolean;
};
type Call = {
  callData: string;
  target: string;
};
/**
 * Init some interface(s) to encode/decode data
 */
const erc20Iface = new utils.Interface(HumanStandardTokenABI);
const mcallV2Iface = new utils.Interface(MulticallV2ABI);

export class MulticallHelper {
  static encodeBalanceOf(multicallAddress: string, who: string) {
    return (t: Token) => ({
      callData: t.isNative
        ? mcallV2Iface.encodeFunctionData('getEthBalance', [who])
        : erc20Iface.encodeFunctionData('balanceOf', [who]),
      target: t.isNative ? multicallAddress : t.contractAddress,
    });
  }

  static decodeBalanceOf(r: MulticallV2Result): BigNumber {
    return r.success
      ? erc20Iface.decodeFunctionResult('balanceOf', r.returnData)[0]
      : undefined;
  }

  static async tryCall(
    multicallV2Address: string,
    rpcUrl: string,
    calls: Call[],
    requireAllSuccess = false
  ): Promise<MulticallV2Result[]> {
    /**
     * workaround from https://github.com/ethers-io/ethers.js/issues/1886#issuecomment-1063531514
     * related to service worker(`XMLHttpRequest` vs `fetch` API) & ethers.js
     */
    const contract = new Contract(
      multicallV2Address,
      mcallV2Iface,
      new StaticJsonRpcProvider({
        url: rpcUrl,
        skipFetchSetup: true,
      })
    );
    const returnData = await contract.callStatic
      .tryAggregate(requireAllSuccess, calls)
      .catch((e: any) => {
        console.error('_fetchBalancesByMulticall::error:', e);
      });
    return returnData;
  }
}
