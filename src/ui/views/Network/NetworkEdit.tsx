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
import { useHistory, useParams } from 'react-router';
import axios, { AxiosError } from 'axios';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import { Button, Input, Select } from 'antd';
import Header from 'ui/components/Header';
// import { categoryToIconSVG } from 'ui/utils/networkCategoryToIcon';
// import DefaulutIcon from 'assets/tokens/default.svg';
import { isString } from 'util';
import { checkIsLegitURL, checkIsTrimmed } from './field-check-rules';
import { BigNumber } from 'ethers';
import { defaultNetworks } from 'constants/defaultNetwork';
import { useSelector } from 'react-redux';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';

// const Icon = (src: string) => <img className="category-icon" src={src} />;

const NetworkEdit = () => {
  const { t } = useTranslation();
  const networkContext = useContext(NetworkProviderContext);
  const history = useHistory();
  const { idx } = useParams<{ idx: string | undefined }>();
  const formattedIdx = useMemo(() => Number(idx), [idx]);

  const isEdit = useMemo(() => {
    return !isNaN(formattedIdx) && Number.isInteger(formattedIdx);
  }, [idx]);

  const customNetworks = useSelector((s) => s.customNetworks);

  const fieldsPresetValues = useMemo(() => {
    const emptyResult = {
      chainId: '',
      explorerUrl: '',
      networkName: '',
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
        rpcUrl: provider.rpcUrl || '',
        symbol: provider.ticker || '',
      };
    }
  }, [isEdit, formattedIdx, networkContext]);

  const checkRpcUrlAndSetChainId = useCallback(
    async (value: string) => {
      console.info(`RPC URL is ${value}`);
      try {
        if (!value) return undefined;

        const isExistedRpc =
          customNetworks.filter((p) => p.rpcUrl === value).length > 0;
        if (isExistedRpc && !isEdit) {
          return t('same_rpc_url');
        }

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
        // form.setFieldsValue({ chainId: Number(data.result) });
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

        return uiErrorMsg;
      }
      return undefined;
    },
    [customNetworks]
  );

  const editNetwork = useCallback(
    async ({
      chainId,
      explorerUrl,
      networkName,
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
          symbol,
          explorerUrl
        );
      } else {
        console.debug('Adding Custom Provider');
        await networkContext?.addCustomProvider(
          networkName as string,
          rpcUrl,
          chainId,
          symbol,
          explorerUrl
        );
      }

      ClickToCloseMessage.success({
        content: t('Custom Provider Saved!'),
      });
      history.goBack();
    },
    [history, networkContext, isEdit, formattedIdx]
  );

  const checkNetworkNickname = useCallback(
    (value: string) => {
      const maxCharsInNickname = 20;
      if (value.length > maxCharsInNickname) {
        return `The length of ${'nickname'} is no longer than ${maxCharsInNickname} chars.`;
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

  const [errorMsg, setErrorMsg] = useState<Record<string, string | undefined>>(
    {}
  );

  const setErrorMessage = (fieldName: string, message?: string) => {
    // form.setFields([
    //   {
    //     name: fieldName,
    //     errors: [message].filter(isString),
    //   },
    // ]);
    setErrorMsg((prevS) => ({ ...prevS, [fieldName]: message }));
  };

  const validateFields = async (values: typeof fieldsPresetValues) => {
    const errors: any = {};
    const requiredFields = ['networkName', 'rpcUrl', 'chainId'];
    requiredFields.forEach((fName) => {
      if (!values[fName]) {
        errors[fName] = `${fName} is Required`;
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
    errors.networkName = checkNetworkNickname(values.networkName);
    errors.rpcUrl = await checkRpcUrlAndSetChainId(values.rpcUrl);
    try {
      BigNumber.from(values.chainId);
    } catch (_) {
      errors.chainId = t('bad_chain_id');
    }
    Object.keys(errors).forEach((field) => {
      if (!errors[field]) delete errors[field];
    })
    return errors;
  };

  return (
    <div className="flexCol network-page-container network-edit">
      <Header title={t('CustomizeNetwork')} />
      <Formik
        initialValues={fieldsPresetValues}
        validate={validateFields}
        onSubmit={async (values, { setSubmitting }) => {
          await editNetwork(values);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, ...formilk }) => (
          <Form>
            <div className="form-body content-wrap-padding">
              {/* <Form.Item label={t('Network Name')} name="networkName" required> */}
              <h1 className="required">{t('Network Name')}</h1>
              <Field name="networkName" placeholder="Enter Network Name" />
              <ErrorMessage name="networkName" component="div" />
              <h1 className="required">{t('RPC URL')}</h1>
              <Field name="rpcUrl" placeholder="Enter RPC URL" />
              <ErrorMessage name="rpcUrl" component="div" />
              <h1 className="required">{t('Chain ID')}</h1>
              <Field name="chainId" placeholder={t('CHAIN_ID_INPUT_PLACEHOLDER')} />
              <ErrorMessage name="chainId" component="div" className="input-error" />
              <h1>{t('Currency Symbol')}</h1>
              <Field name="symbol" placeholder={t('Optional')} />
              <ErrorMessage name="symbol" component="div" />
              <h1>{t('Block Explorer URL')}</h1>
              <Field name="explorerUrl" placeholder={t('Optional')} />
              <ErrorMessage name="explorerUrl" component="div" />
            </div>
            <Button
              type="primary"
              htmlType="submit"
              style={{ margin: '24px', width: "312px" }}
              disabled={Object.keys(formilk.errors).length > 0}
            >
              {t('Next')}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default NetworkEdit;
