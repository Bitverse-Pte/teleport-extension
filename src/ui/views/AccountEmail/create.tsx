import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';
import Header from 'ui/components/Header';
import EmailMode from './emailMode';
import './style.less';

const AccountEmail = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useDarkmode();

  return (
    <div className={clsx('email-wrap flexCol', { dark: isDarkMode })}>
      <Header title="Create MPC Wallet" />
      <EmailMode redirect="mpcwalletbackup"></EmailMode>
    </div>
  );
};

export default AccountEmail;
