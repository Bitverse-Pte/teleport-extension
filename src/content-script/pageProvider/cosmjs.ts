import {
  AccountData,
  AminoSignResponse,
  OfflineSigner,
  StdSignDoc,
} from '@cosmjs/launchpad';
import { Keplr } from 'types/cosmos';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { DirectSignResponse } from '@cosmjs/proto-signing/build/signer';
import { SignDoc } from '@cosmjs/proto-signing/build/codec/cosmos/tx/v1beta1/tx';

export class CosmJSOfflineSigner implements OfflineSigner, OfflineDirectSigner {
  private _chainId: string;
  private _keplr: Keplr;
  constructor(
    protected readonly chainId: string,
    protected readonly keplr: Keplr
  ) {
    this._chainId = chainId;
    this._keplr = keplr;
  }

  async getAccounts(): Promise<AccountData[]> {
    const key = await this._keplr.getKey(this._chainId);
    console.log('=====key=====', key);
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
    if (this._chainId !== signDoc.chain_id) {
      throw new Error('Unmatched chain id with the offline signer');
    }

    const key = await this._keplr.getKey(signDoc.chain_id);

    if (key.bech32Address !== signerAddress) {
      throw new Error('Unknown signer address');
    }

    return await this._keplr.signAmino(this._chainId, signerAddress, signDoc);
  }

  async signDirect(
    signerAddress: string,
    signDoc: SignDoc
  ): Promise<DirectSignResponse> {
    if (this._chainId !== signDoc.chainId) {
      throw new Error('Unmatched chain id with the offline signer');
    }

    const key = await this._keplr.getKey(signDoc.chainId);

    if (key.bech32Address !== signerAddress) {
      throw new Error('Unknown signer address');
    }

    return await this._keplr.signDirect(this._chainId, signerAddress, signDoc);
  }
}
