import clsx from 'clsx';
import React from 'react';
import { useDarkmode } from 'ui/hooks/useDarkMode';

interface TransactionItemDetailProps {
  name: string;
  hoverValueText?: string;
  value: React.ReactNode;
}

export function TransactionItemDetail({
  name,
  hoverValueText,
  value,
}: TransactionItemDetailProps) {
  const { isDarkMode } = useDarkmode();
  return (
    <div className="row">
      <div className="field-name">{name}</div>
      <div
        className={clsx('field-value', {
          dark: isDarkMode,
        })}
        title={hoverValueText}
      >
        {value}
      </div>
    </div>
  );
}
