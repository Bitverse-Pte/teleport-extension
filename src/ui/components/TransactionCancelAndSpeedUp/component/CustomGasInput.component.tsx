import { InputNumber } from 'antd';
import { PRIORITY_LEVELS } from 'constants/gas';
import { Transaction } from 'constants/transaction';
import { BigNumber, utils } from 'ethers';
import React from 'react';
import { useSetState } from 'react-use';

type SetStateGetter<T> = Partial<T>;
type SetStateSetter<T> = (x: Partial<T>) => void;
type SetState<T> = [SetStateGetter<T>, SetStateSetter<T>];

interface CustomGasInputProps {
  gasLimit?: number | string;
  selectedGasTier: PRIORITY_LEVELS;
  isEIP1559Tx: boolean;
  setGasLimit: (x: string) => void;
  gasPriceuseSetState: SetState<Transaction['txParams']>;
}

export function CustomGasInput({
  gasLimit,
  selectedGasTier,
  isEIP1559Tx,
  gasPriceuseSetState: [customGasPrice, setCustomGasPrice],
  ...props
}: CustomGasInputProps) {
  const [customTxParamsError, setCustomTxParamsError] = useSetState<
    Partial<Transaction['txParams']>
  >({});

  if (selectedGasTier !== PRIORITY_LEVELS.CUSTOM) {
    return null;
  }

  return (
    <div
      className="flex items-center flex-col custom-gas"
      style={{ marginTop: 4 }}
    >
      <div className="field">
        <h1 className="form-title bold">Gas Limit</h1>
        <InputNumber<string>
          style={{ width: '100% ' }}
          stringMode
          value={Number(gasLimit || 21000).toString()}
          min="21000"
          controls={false}
          onBlur={({ target }) => {
            try {
              props.setGasLimit(BigNumber.from(target.value).toHexString());
            } catch (error) {
              console.error('setGasLimit::error:', error);
              setCustomTxParamsError({
                gasLimit: 'bad input',
              });
            }
          }}
        />
      </div>
      {!isEIP1559Tx && (
        <div className="field">
          <h1 className="form-title bold">Gas Price</h1>
          <InputNumber<string>
            style={{ width: '100% ' }}
            addonAfter="Gwei"
            // onChange={onChange}
            stringMode
            value={utils.formatUnits(customGasPrice.gasPrice || '0', 'gwei')}
            controls={false}
            onBlur={({ target: { value } }) => {
              try {
                const gasPrice = utils.parseUnits(value, 'gwei').toHexString();
                setCustomGasPrice({
                  gasPrice,
                });
              } catch (error) {
                console.error('setCustomGasPrice::error', error);
                setCustomTxParamsError({
                  gasPrice: 'bad input',
                });
              }
            }}
          />
        </div>
      )}
      {isEIP1559Tx && (
        <div className="field">
          <h1 className="form-title bold">Max Fee</h1>
          <InputNumber<string>
            style={{ width: '100% ' }}
            value={utils.formatUnits(
              customGasPrice.maxFeePerGas || '0',
              'gwei'
            )}
            controls={false}
            onBlur={({ target: { value } }) => {
              try {
                const maxFeePerGas = utils
                  .parseUnits(value, 'gwei')
                  .toHexString();
                setCustomGasPrice({
                  maxFeePerGas,
                });
              } catch (error) {
                console.error('setCustomGasPrice::error', error);
                setCustomTxParamsError({
                  maxFeePerGas: 'bad input',
                });
              }
            }}
            addonAfter="Gwei"
            stringMode
          />
        </div>
      )}
      {isEIP1559Tx && (
        <div className="field">
          <h1 className="form-title bold">Max Priority Fee</h1>
          <InputNumber<string>
            style={{ width: '100% ' }}
            value={utils.formatUnits(
              customGasPrice.maxPriorityFeePerGas || '0',
              'gwei'
            )}
            controls={false}
            onBlur={({ target: { value } }) => {
              try {
                const maxPriorityFeePerGas = utils
                  .parseUnits(value, 'gwei')
                  .toHexString();
                setCustomGasPrice({
                  maxPriorityFeePerGas,
                });
              } catch (error) {
                console.error('setCustomGasPrice::error', error);
                setCustomTxParamsError({
                  maxPriorityFeePerGas: 'bad input',
                });
              }
            }}
            addonAfter="Gwei"
            stringMode
          />
        </div>
      )}
    </div>
  );
}
