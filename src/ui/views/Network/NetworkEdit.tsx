import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import './style.less';
import { useHistory, useParams } from 'react-router';
import axios, { AxiosError } from 'axios';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import { Button, Form, Input, message, Select } from 'antd';
import Header from 'ui/components/Header';
import { categoryToIconSVG } from 'ui/utils/networkCategoryToIcon';
import DefaulutIcon from 'assets/tokens/default.svg';
import { isString } from 'util';
import { checkIsLegitURL, checkIsTrimmed } from './field-check-rules';
import { BigNumber } from 'ethers';
import { defaultNetworks } from 'constants/defaultNetwork';
import { useSelector } from 'react-redux';

const Icon = (src: string) => <img className="category-icon" src={src} />;

const NetworkEdit = () => {
  const { t } = useTranslation();
  const networkContext = useContext(NetworkProviderContext);
  const history = useHistory();
  const { idx } = useParams<{ idx: string | undefined }>();
  const formattedIdx = useMemo(() => Number(idx), [idx]);

  const isEdit = useMemo(() => {
    return !isNaN(formattedIdx) && Number.isInteger(formattedIdx);
  }, [idx]);

  const fieldsPresetValues: Record<string, string> = useMemo(() => {
    const emptyResult = {
      chainId: '',
      explorerUrl: '',
      networkName: '',
      category: 'ETH',
      rpcUrl: '',
      symbol: '',
    };
    const provider = networkContext?.getCustomProvider(formattedIdx);
    if (!isEdit || !provider) {
      return emptyResult;
    } else {
      return {
        explorerUrl: provider.rpcPrefs.blockExplorerUrl || '',
        chainId: provider.chainId || '',
        networkName: provider.nickname || '',
        category: provider.category,
        rpcUrl: provider.rpcUrl || '',
        symbol: provider.ticker || '',
      };
    }
  }, [isEdit, formattedIdx, networkContext]);

  const [form] = Form.useForm();
  const customNetworks = useSelector((s) => s.customNetworks);

  const checkRpcUrlAndSetChainId = useCallback(
    async (value: string) => {
      console.info(`RPC URL is ${value}`);
      try {
        if (!value) return setErrorMessage('rpcUrl');

        const isExistedRpc =
          customNetworks.filter((p) => p.rpcUrl === value).length > 0;
        if (isExistedRpc && !isEdit) {
          throw new Error(t('same_rpc_url'));
        }

        checkIsTrimmed(value);
        checkIsLegitURL(value);
        type JsonRpcResult = {
          result: string;
        };
        const { data } = await axios.post<JsonRpcResult>(value, {
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 83,
        });
        /**
         * Handle bad RPC that do not respond chainId
         */
        if (isNaN(Number(data.result))) {
          throw new Error(t('Bad_RPC_URL'));
        }
        form.setFieldsValue({ chainId: Number(data.result) });
        setErrorMessage('rpcUrl');
      } catch (error: any | Error | AxiosError) {
        console.error('checkRpcUrlAndSetChainId::error: ', error);
        let uiErrorMsg = '';
        if (axios.isAxiosError(error)) {
          if (!error.response) {
            uiErrorMsg = t('Bad_RPC_URL');
          } else if (
            error.response?.status % 400 >= 0 &&
            error.response?.status % 400 < 100
          ) {
            uiErrorMsg = t('rpc_url_404');
          } else if (
            error.response?.status % 500 >= 0 &&
            error.response?.status % 500 < 100
          ) {
            uiErrorMsg = t('rpc_url_500');
          } else {
            uiErrorMsg = error.message || t('Bad_RPC_URL');
          }
        } else if ((error as Error).message) {
          uiErrorMsg = error.message;
        }

        setErrorMessage('rpcUrl', uiErrorMsg);
      }
    },
    [form, customNetworks]
  );

  const editNetwork = useCallback(
    async ({
      chainId,
      explorerUrl,
      networkName,
      category,
      rpcUrl,
      symbol,
    }: {
      [x: string]: string;
    }) => {
      if (isEdit) {
        console.debug(`Editing Custom Provider Idx ${formattedIdx}`);
        await networkContext?.editCustomProvider(
          formattedIdx,
          networkName as string,
          rpcUrl,
          chainId,
          category || 'ETH',
          symbol,
          explorerUrl
        );
      } else {
        console.debug('Adding Custom Provider');
        await networkContext?.addCustomProvider(
          networkName as string,
          rpcUrl,
          chainId,
          category || 'ETH',
          symbol,
          explorerUrl
        );
      }

      message.success({
        content: t('Custom Provider Saved!'),
      });
      history.goBack();
    },
    [history, networkContext, isEdit, formattedIdx]
  );

  const checkNetworkNickname = useCallback(
    (_: unknown, value: string) => {
      const maxCharsInNickname = 20;
      checkIsTrimmed(value);
      if (value.length > maxCharsInNickname) {
        throw new Error(
          `The length of ${'nickname'} is no longer than ${maxCharsInNickname} chars.`
        );
      }

      const sameNameWithDefaultNet =
        Object.values(defaultNetworks).filter(
          (p) => Boolean(p) && p.nickname === value
        ).length > 0;
      if (sameNameWithDefaultNet) {
        throw new Error(
          'Same name with our preset provider, please rename your provider name.'
        );
      }
      const sameNameWithCustomNetwork =
        customNetworks.filter((p) => p.nickname === value).length > 0;
      if (sameNameWithCustomNetwork && !isEdit) {
        throw new Error(
          'Same name with existed provider, please rename your provider name.'
        );
      }
    },
    [customNetworks]
  );

  const setErrorMessage = useCallback(
    (fieldName: string, message?: string) => {
      form.setFields([
        {
          name: fieldName,
          errors: [message].filter(isString),
        },
      ]);
    },
    [form]
  );

  const categories = [
    { label: 'Ethereum Network', value: 'ETH' },
    { label: 'Binance Network', value: 'BSC' },
    { label: 'Polygon Network', value: 'POLYGON' },
    { label: 'Arbitrum', value: 'ARBITRUM' },
  ];

  return (
    <div className="flexCol network-page-container network-edit">
      <Header title={t('Customize Network')} />
      <Form
        form={form}
        layout="vertical"
        initialValues={fieldsPresetValues}
        onFinish={editNetwork}
        className="content-wrap-padding"
      >
        <div className="form-body">
          <Form.Item
            label={t('Network Name')}
            name="networkName"
            required
            rules={[{ required: true }]}
          >
            <Input
              className="rounded-md"
              placeholder="Enter Network Name"
              onBlur={({ target: { value } }) => {
                try {
                  checkNetworkNickname(undefined, value);
                } catch (error: any) {
                  setErrorMessage('networkName', error.message);
                }
              }}
            />
          </Form.Item>
          <Form.Item label={t('RPC URL')} name="rpcUrl" required>
            <Input
              className="rounded-md"
              placeholder="Enter RPC URL"
              onBlur={({ target }) => checkRpcUrlAndSetChainId(target.value)}
            />
          </Form.Item>
          <Form.Item
            label={t('Chain ID')}
            name="chainId"
            required
            rules={[
              { required: true },
              {
                validator: async (_, value) => {
                  try {
                    checkIsTrimmed(value);
                    BigNumber.from(value);
                  } catch (error) {
                    setErrorMessage('chainId', t('bad_chain_id'));
                    console.error('chainId::validator', error);
                  }
                },
              },
            ]}
          >
            <Input
              className="rounded-md"
              placeholder="should automatically filled if RPC URL provided"
            />
          </Form.Item>
          <Form.Item
            name="category"
            label={t('Belonging Chain')}
            rules={[{ required: true }]}
          >
            <Select>
              {categories.map(({ label, value }) => {
                return (
                  <Select.Option value={value} key={value}>
                    <div className="item-container">
                      {Icon(categoryToIconSVG(value) || DefaulutIcon)}
                      <span className="symbol">{value}</span>
                      <span className="label">{label}</span>
                    </div>
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item name="symbol" label={t('Currency Symbol')}>
            <Input
              className="rounded-md"
              placeholder={t('Optional')}
              onBlur={({ target: { value } }) => {
                try {
                  checkIsTrimmed(value);
                  setErrorMessage('symbol');
                } catch (error: any) {
                  setErrorMessage('symbol', error.message);
                }
              }}
            />
          </Form.Item>
          <Form.Item name="explorerUrl" label={t('Block Explorer URL')}>
            <Input
              className="rounded-md"
              placeholder={t('Optional')}
              onBlur={({ target: { value: val } }) => {
                try {
                  if (val !== '') {
                    checkIsLegitURL(val);
                    checkIsTrimmed(val);
                  }
                  setErrorMessage('explorerUrl');
                } catch (error: any) {
                  setErrorMessage(
                    'explorerUrl',
                    error.message || t('validation error')
                  );
                }
              }}
            />
          </Form.Item>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            {t('Next')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NetworkEdit;
