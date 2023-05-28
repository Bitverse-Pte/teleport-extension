import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';
import Header from 'ui/components/Header';
import './style.less';
import EmailMode from './emailMode';

const AccountEmail = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useDarkmode();

  return (
    <div className={clsx('email-wrap flexCol', { dark: isDarkMode })}>
      <Header title="Recovery Wallet" />
      <EmailMode redirect="mpc-recovery-wallet"></EmailMode>
    </div>
  );
};

export default AccountEmail;
