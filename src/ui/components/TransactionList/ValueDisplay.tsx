import React from 'react';

import './style.less';
// import { Transaction, TransactionGroup } from "@/_constants/transaction";

export function ValueDisplay({ value }: { value: string }) {
  return (
    <div className="value-display">
      <p className="value">{value}</p>
    </div>
  );
}
