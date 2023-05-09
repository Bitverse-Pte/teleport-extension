import abiDecoder from 'abi-decoder';
import { abi } from '@openzeppelin/contracts/build/contracts/ERC20.json';
import { ethers } from 'ethers';
import { networkPreferenceService } from 'background/service';

/**
 * 解析 calldata 
 * @param data 
 * @returns 
 * * @example
 * {
      name: 'transfer',
      params: [
        {
          name: 'to',
          value: '0xa9aa4613fada2287935ce5d6d375c28d248b5b50',
          type: 'address'
        },
        { name: 'amount', value: '20000', type: 'uint256' }
      ]
    }
 */
export const parseErc20Data = (data: string) => {
  // 1. add abi
  abiDecoder.addABI(abi);
  // 2. decode data
  const decodedData = abiDecoder.decodeMethod(data);
  return decodedData;
};

/**
 * 获取合约symbol
 * @param contractAddress
 * @returns
 */
export const getSymbolByERC20Contract = async (contractAddress: string) => {
  const rpc = networkPreferenceService.getProviderConfig().rpcUrl;
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const symbol = await contract.symbol();
  return symbol;
};
