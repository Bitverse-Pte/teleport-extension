import {
  AccountData,
  AminoSignResponse,
  OfflineSigner,
  StdSignDoc,
} from '@cosmjs/launchpad';
import { Keplr } from '@keplr-wallet/types';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { DirectSignResponse } from '@cosmjs/proto-signing/build/signer';
import { SignDoc } from '@cosmjs/proto-signing/build/codec/cosmos/tx/v1beta1/tx';

export class CosmJSOfflineSigner implements OfflineSigner, OfflineDirectSigner {
  constructor(
    protected readonly chainId: string,
    protected readonly keplr: Keplr
  ) {
    this.chainId = chainId;
    this.keplr = keplr;
  }

  async getAccounts(): Promise<AccountData[]> {
    const key = {
      bech32Address: '',
      pubKey: '__uint8array__' as unknown as Uint8Array,
    }; //await this.keplr.getKey(this.chainId);

    return [
      {
        address: key.bech32Address,
        // Currently, only secp256k1 is supported.
        algo: 'secp256k1',
        pubkey: key.pubKey,
      },
    ];
  }

  async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    if (this.chainId !== signDoc.chain_id) {
      throw new Error('Unmatched chain id with the offline signer');
    }

    const key = await this.keplr.getKey(signDoc.chain_id);

    if (key.bech32Address !== signerAddress) {
      throw new Error('Unknown signer address');
    }

    return await this.keplr.signAmino(this.chainId, signerAddress, signDoc);
  }

  async signDirect(
    signerAddress: string,
    signDoc: SignDoc
  ): Promise<DirectSignResponse> {
    if (this.chainId !== signDoc.chainId) {
      throw new Error('Unmatched chain id with the offline signer');
    }

    const key = await this.keplr.getKey(signDoc.chainId);

    if (key.bech32Address !== signerAddress) {
      throw new Error('Unknown signer address');
    }

    return await this.keplr.signDirect(this.chainId, signerAddress, signDoc);
  }
}
