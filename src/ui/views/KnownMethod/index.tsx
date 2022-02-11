import { useSelector } from 'react-redux';
import React, { useCallback, useState } from 'react';
import { Button, Input, List } from 'antd';
import { useWallet } from 'ui/utils';
import { getMethodDataAsync } from 'ui/utils/transactions';
import { currentEthProviderSelector } from 'ui/selectors/selectors';

export default function KnownMethodPage() {
  const methodDict = useSelector((s) => s.knownMethod);
  const [input, setInput] = useState('');
  const wallet = useWallet();

  const [highlightIdx, setHighlightIdx] = useState(-1);

  const provider = useSelector(currentEthProviderSelector);

  const handleQuery = useCallback(async () => {
    if (methodDict[input]) {
      // matched, highlight item
      setHighlightIdx(Object.keys(methodDict).findIndex((v) => v === input));
      return;
    }

    const data = await getMethodDataAsync(input, provider);
    if (!data.name) {
      console.debug('Method not found');
    }
    await wallet.addKnownMethodData(input, data);
  }, [wallet, provider, input]);

  return (
    <div className="known-method">
      <List>
        {Object.entries(methodDict).map(([sig, data], idx) => {
          return (
            <List.Item
              key={sig}
              title={sig}
              style={
                highlightIdx === idx
                  ? {
                      background: 'yellow',
                    }
                  : {}
              }
            >
              {data?.name}(
              {data?.params?.length !== 0 &&
                data?.params?.map((p) => p.type).join(',')}
              )
            </List.Item>
          );
        })}
      </List>
      <Input
        placeholder="Please enter content"
        value={input}
        onChange={({ target: { value: val } }) => {
          setInput(val);
        }}
      />
      <Button onClick={handleQuery}>Query 'n Save</Button>
    </div>
  );
}
