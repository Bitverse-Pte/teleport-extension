import React from 'react';

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
  return (
    <div className="row">
      <div className="field-name">{name}</div>
      <div className="field-value" title={hoverValueText}>
        {value}
      </div>
    </div>
  );
}
