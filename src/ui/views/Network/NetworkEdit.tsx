import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import './style.less';
import { useHistory, useParams, useLocation } from 'react-router';
import axios, { AxiosError } from 'axios';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import { Button, Input, Select } from 'antd';
import { checkIsLegitURL, checkIsTrimmed } from './field-check-rules';
import { BigNumber, utils } from 'ethers';
import { defaultNetworks } from 'constants/defaultNetwork';
import { useDispatch, useSelector } from 'react-redux';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import clsx from 'clsx';
import skynet from 'utils/skynet';
import {
  hideLoadingIndicator,
  showLoadingIndicator,
} from 'ui/reducer/appState.reducer';
import { useChainList } from 'ui/hooks/utils/useChainList';
import { Ecosystem } from 'types/network';
import { useNetworkTypeSelectionComponent } from './component/NetworkTypeSelection';
import { useDarkmode } from 'ui/hooks/useDarkMode';
const { sensors } = skynet;

// const Icon = (src: string) => <img className="category-icon" src={src} />;

/**
 * No add / edit for providers in Cosmos ecosystem.
 */
const EcosystemThatCanAddEdit = [Ecosystem.EVM];

const NetworkEdit = () => {
  const { t } = useTranslation();
  const networkContext = useContext(NetworkProviderContext);
  const history = useHistory();
  const location = useLocation();
  const { id } = useParams<{ id: string | undefined }>();

  const isEdit = !!id;

  const { networks: customNetworks, isLoaded: isProviderLoaded } = useSelector(
    (s) => s.customNetworks
  );

  useEffect(() => {
    if (!isProviderLoaded) {
      showLoadingIndicator();
    } else {
      hideLoadingIndicator();
    }
  }, [isProviderLoaded]);

  const [fetchedChainId, setFetchedChainId] = useState<string | undefined>();
  const chainListData = useChainList();
  const matchedProvider = useMemo(() => {
    if (!isEdit) {
      return undefined;
    }
    console.debug('matchedProvider::customNetworks:', customNetworks);
    return customNetworks.find((n) => n.id === id);
  }, [isEdit, id, customNetworks]);

  const fieldsPresetValues = useMemo(() => {
    const emptyResult = {
      chainId: '',
      explorerUrl: '',
      networkName: '',
      rpcUrl: '',
      symbol: '',
    };
    if (!matchedProvider) {
      return emptyResult;
    } else {
      return {
        explorerUrl: matchedProvider.rpcPrefs.blockExplorerUrl || '',
        chainId: Number(matchedProvider.chainId).toString(10) || '',
        networkName: matchedProvider.nickname || '',
        rpcUrl: matchedProvider.rpcUrl || '',
        symbol: matchedProvider.ticker || '',
      };
    }
  }, [matchedProvider]);

  const checkRpcUrlAndSetChainId = useCallback(
    async (value: string) => {
      console.info(`RPC URL is ${value}`);
      try {
        if (!value) return undefined;

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
          return t('Bad_RPC_URL');
        }
        setFetchedChainId(data.result);

        const isExistedRpc =
          customNetworks.filter((p) => p.rpcUrl === value).length > 0;
        if (isExistedRpc && !isEdit) {
          return t('same_rpc_url');
        }
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

        return uiErrorMsg;
      }
      return undefined;
    },
    [customNetworks]
  );
  const dispatch = useDispatch();
  const editNetwork = useCallback(
    async (
      {
        chainId,
        explorerUrl,
        networkName,
        rpcUrl,
        symbol,
      }: {
        [x: string]: string;
      },
      { setSubmitting }: { setSubmitting: (v: boolean) => void }
    ) => {
      dispatch(showLoadingIndicator());
      if (isEdit) {
        console.debug(`Editing Custom Provider ID ${id}`);
        await networkContext?.editCustomEthereumProvider(
          id,
          networkName as string,
          rpcUrl,
          chainId,
          symbol,
          explorerUrl
        );
        sensors.track('teleport_customize_network_edit', {
          page: location.pathname,
          networkName: networkName,
          rpcUrl: rpcUrl,
          chainId: chainId,
          symbol: symbol,
        });
      } else {
        console.debug('Adding Custom Provider');
        await networkContext?.addCustomEthereumProvider(
          networkName as string,
          rpcUrl,
          chainId,
          symbol,
          explorerUrl
        );
        sensors.track('teleport_customize_network_add', {
          page: location.pathname,
          networkName: networkName,
          rpcUrl: rpcUrl,
          chainId: chainId,
          symbol: symbol,
          explorerUrl: explorerUrl,
        });
      }
      dispatch(hideLoadingIndicator());
      setSubmitting(false);
      ClickToCloseMessage.success({
        content: t('Custom Provider Saved!'),
      });
      history.push('/home');
    },
    [history, networkContext, isEdit, id]
  );

  const checkNetworkNickname = useCallback(
    (value: string) => {
      const maxCharsInNickname = 20;
      if (value.length > maxCharsInNickname) {
        return `The length of ${'nickname'} is no longer than ${maxCharsInNickname} characters.`;
      }

      const sameNameWithDefaultNet =
        Object.values(defaultNetworks).filter(
          (p) => Boolean(p) && p.nickname === value
        ).length > 0;
      if (sameNameWithDefaultNet) {
        return 'Same name with our preset provider, please rename your provider name.';
      }
      const sameNameWithCustomNetwork =
        customNetworks.filter((p) => p.nickname === value).length > 0;
      if (sameNameWithCustomNetwork && !isEdit) {
        return 'Same name with existed provider, please rename your provider name.';
      }
      /**
       * return undefine if checks are passed
       */
      return undefined;
    },
    [customNetworks]
  );

  const [symbolWarningMessage, setSymbolWarningMessage] = useState<string>();

  /** @TODO use `selectedNetworkType` later */
  const { component: NetworkTypeSelector, selectedNetworkType } =
    useNetworkTypeSelectionComponent(isEdit);

  const validateFields = useCallback(
    async (values: typeof fieldsPresetValues) => {
      const errors: any = {};
      const requiredFields = ['networkName', 'rpcUrl', 'chainId'];
      requiredFields.forEach((fName) => {
        if (!values[fName]) {
          errors[fName] = t(`required_field_${fName}`);
        }
      });
      const mustTrimmedFields = [...requiredFields, 'explorerUrl'];
      mustTrimmedFields.forEach((fName) => {
        try {
          checkIsTrimmed(values[fName]);
        } catch (error: any) {
          errors[fName] = error.message;
        }
      });
      ['explorerUrl', 'rpcUrl'].forEach((fName) => {
        try {
          // skip if empty
          if (!values[fName]) return;
          checkIsLegitURL(values[fName]);
        } catch (error: any) {
          errors[fName] = error.message;
        }
      });
      if (values.networkName)
        errors.networkName = checkNetworkNickname(values.networkName);
      if (values.rpcUrl)
        errors.rpcUrl = await checkRpcUrlAndSetChainId(values.rpcUrl);
      try {
        const chainIdBN = BigNumber.from(values.chainId);
        if (fetchedChainId && !chainIdBN.eq(fetchedChainId)) {
          errors.chainId = t('mismatched_chain_id', {
            replace: {
              got: Number(fetchedChainId),
            },
          });
        }
        /**
         * Basic chain id validation passed, now looking for existed provider with same chainId
         */
        const matchedProvider = customNetworks
          .filter((p) => EcosystemThatCanAddEdit.includes(p.ecosystem))
          .find((p) => chainIdBN.eq(p.chainId));
        if (matchedProvider && !isEdit) {
          errors.chainId = t('chainIdExistsErrorMsg', {
            replace: {
              name: matchedProvider.nickname,
            },
          });
        }
      } catch (error) {
        console.error('validate_chainId::error:', error);
        errors.chainId = t('bad_chain_id');
      }
      /**
       * validating symbol
       */
      if (!chainListData.loading && chainListData.value) {
        const matchedChain = chainListData.value.find((c) =>
          BigNumber.from(values.chainId).eq(c.chainId)
        );
        if (
          matchedChain &&
          matchedChain.nativeCurrency.symbol !== values.symbol
        ) {
          setSymbolWarningMessage(
            t('chainListReturnedDifferentTickerSymbol', {
              replace: {
                chainId: values.chainId,
                returnedNativeCurrencySymbol:
                  matchedChain.nativeCurrency.symbol,
              },
            })
          );
        } else {
          setSymbolWarningMessage(undefined);
        }
      }
      Object.keys(errors).forEach((field) => {
        if (!errors[field]) delete errors[field];
      });
      return errors;
    },
    [checkRpcUrlAndSetChainId, customNetworks, fetchedChainId, chainListData]
  );

  const { isDarkMode } = useDarkmode();

  if (!matchedProvider && isEdit) {
    /**
     * in edit mode, need to wait for `customNetworks` loaded from service worker
     * so we can fill the form, so set a loading in the mean time
     */
    return (
      <div className={clsx('network-edit h-full', { dark: isDarkMode })}>
        <div className="box">
          <h1 className="title">{t('loading')}...</h1>
          <p>{t('network_loading_message')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx('network-edit', { dark: isDarkMode })}
      style={{ minHeight: '100%' }}
    >
      <div className="flexCol network-page-container">
        <div className="edit-network-header flex justify-center">
          <h1 className="title">{t('CustomizeNetwork')}</h1>
        </div>
        <Formik
          initialValues={fieldsPresetValues}
          validate={validateFields}
          onSubmit={editNetwork}
        >
          {({ isSubmitting, ...formilk }) => {
            const isFormNotFinished = Object.keys(formilk.errors).length > 0;
            return (
              <Form className="form-deco">
                <div className="form-body">
                  {NetworkTypeSelector}
                  <h1 className="required">{t('Network Name')}</h1>
                  <Field name="networkName" placeholder="Enter Network Name" />
                  <ErrorMessage
                    name="networkName"
                    component="div"
                    className="input-error"
                  />
                  <h1 className="required">{t('RPC URL')}</h1>
                  <Field name="rpcUrl" placeholder="Enter RPC URL" />
                  <ErrorMessage
                    name="rpcUrl"
                    component="div"
                    className="input-error"
                  />
                  <h1 className="required">{t('Chain ID')}</h1>
                  <Field
                    name="chainId"
                    placeholder={t('CHAIN_ID_INPUT_PLACEHOLDER')}
                  />
                  <ErrorMessage
                    name="chainId"
                    component="div"
                    className="input-error"
                  />
                  <h1>
                    {t('Currency Symbol')} <span>({t('Optional')})</span>
                  </h1>
                  <Field name="symbol" placeholder={t('Optional')} />
                  <ErrorMessage
                    name="symbol"
                    component="div"
                    className="input-warning"
                  />
                  <div className="input-warning">{symbolWarningMessage}</div>
                  <h1>
                    {t('Block Explorer URL')} <span>({t('Optional')})</span>
                  </h1>
                  <Field name="explorerUrl" placeholder={t('Optional')} />
                  <ErrorMessage
                    name="explorerUrl"
                    component="div"
                    className="input-error"
                  />
                </div>
                <div className="flex justify-center">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className={clsx({
                      disabled_button: isFormNotFinished,
                    })}
                    style={{ width: '250px' }}
                    disabled={isFormNotFinished}
                  >
                    {t('Confirm')}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default NetworkEdit;
