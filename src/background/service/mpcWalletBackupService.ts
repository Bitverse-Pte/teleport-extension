import eventBus from 'eventBus';
import { v4 as uuidv4 } from 'uuid';
import { EVENTS } from 'constants/index';
import { keyringService } from 'background/service';
import httpClient from 'bitverse-http-client';
enum CloudType {
  googleDriver = 'googleDriver',
}

class MPCWalletBackupService {
  isCreating = false;
  bitverseServerbaseURL = 'http://api2.bitverse-dev-1.bitverse.zone';
  googleDriveUploadUrl = 'https://www.googleapis.com/upload/drive/v3/files';
  constructor() {
    this._registerListener();
  }

  private _registerListener() {
    eventBus.addEventListener('mpcWalletBackupService.backupClient', () => {});
  }
  /// 备份客户端分片
  /// RSA私钥存云盘->客户端分片备份服务端->服务端私钥备份到云盘
  private async backupClient(password: string, cloudType: CloudType) {
    await this.verifyPassword(password);

    //   判断当前选中wallet,如果没有选中，return false, 逻辑先跳过
    try {
      console.log(`开发备份钱包WalletId= Cloud=${cloudType}`);

      // 从mcp util 中获取 RSAGenerator

      // const  generator = RSAGenerator.create();
      // const rsaPublicKeyPem = generator.rsaPublicKeyPem;
      // const rsaPrivateKeyPem = generator.rsaPrivateKeyPem;
      console.log(`开始云盘备份私钥WalletId= ,Cloud=${cloudType}`);
      const rsaPrivateKeyPem = `-----BEGIN PUBLIC KEY-----
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjf6OVp0fzHU525LaZu+X
        7SRg4MeyBep4TgfY1Txq5HyGxp8XTiVavcOrQ08qTxR9jcVSKuzg84yhE85epdPm
        pljwhEJA87rn4knw9Uk45u9kaSj67Fbag9gKk+k84BRt9H/sk5O77ei5Zd43TcFE
        fnKP5aO97rhfERcaUi2dOpTJTR+iFgnkeSqgNcNPWJ9nMoHx00k6fggbL92uujf0
        GE7jJTTE+n92wgIQ7DYyanK8KrNRnu8DGHaeV36MoZm0jt8y6Bz85OR9YbHbrJng
        QtPhaeUICPV1N5K6WMYAxxSpNE3oUo6rl8UnOx6mHLKZh5D75w5xfMyDu/CQjgHM
        5QIDAQAB
        -----END PUBLIC KEY-----`;
      await this.backupClientAuth(uuidv4(), rsaPrivateKeyPem, cloudType);
      //   await this.backupClientAuth(
      //     wallet.walletId,
      //     rsaPrivateKeyPem,
      //     cloudType,
      //   );
    } catch (error) {
      console.log(error);
    }
  }
  private verifyPassword = (password: string) =>
    keyringService.verifyPassword(password);

  private async backupClientAuth(
    walletId: string,
    clientRsa: string,
    cloudType: CloudType
  ): Promise<void> {
    switch (cloudType) {
      case CloudType.googleDriver:
        this.isCreating = true;
        await this._googleUpload(`${walletId}.x`, clientRsa, cloudType);
        break;

      default:
        break;
    }
  }
  private async getAuthToken(cloudType: CloudType) {
    if (cloudType === CloudType.googleDriver) {
      return '';
    }
    return '';
  }
  private async _googleUpload(
    filename: string,
    content: string,
    cloudType: CloudType
  ) {
    const token = await this.getAuthToken(cloudType);

    const metadata = {
      name: filename, // 文件名
      mimeType: 'text/plain', // 文件类型
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', new Blob([content], { type: 'text/plain' }));

    const res = await fetch(
      `${this.googleDriveUploadUrl}?uploadType=multipart`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      }
    );
    const json = await res.json();
    if (json?.name === filename) {
      return true;
    }
    return false;
  }

  private async clientMasterKeySaveToBackEndServer(
    walletId: string,
    password: string,
    publicKeyPem: string,
    cloudType: CloudType
  ) {
    const walletBackUp = {
      walletId: '8aacc8cf-78b2-43dc-83dc-cd73012cd9db',
      walletGenerateType: 1,
      walletName: 'wallet 29',
      walletDrive: '[]',
      cloudDiskType: 2,
      mpcClientMasterKey: {
        walletAlgorithmType: 1,
        cipherMasterKey: '',
        eccEncryptData: '',
      },
    };
    try {
      const result = await httpClient.post(
        `${this.bitverseServerbaseURL}/bitverse/wallet/v1/private/kms/wallet/backup`,
        {
          ...walletBackUp,
        }
      );
      console.log('[response ok]:', result);
    } catch (error) {
      console.log('[response error]: ', error);
    }
  }
}

export default MPCWalletBackupService;
