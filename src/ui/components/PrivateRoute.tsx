import React, { Suspense, useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useWallet } from 'ui/utils';

const LazyPrivateRoute = ({ children, ...rest }) => {
  const wallet = useWallet();
  const [isBooted, setIsBooted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);

  useEffect(() => {
    wallet.isBooted().then((res) => {
      setIsBooted(res);
    });
  }, []);
  useEffect(() => {
    wallet.isUnlocked().then((res) => {
      setIsUnlocked(res);
    });
  }, []);

  return (
    <Suspense fallback={null}>
      <Route
        {...rest}
        render={() => {
          const to = isBooted ? (isUnlocked ? null : '/unlock') : '/Welcome';
          return children;
        }}
      />
    </Suspense>
  );
};

export default LazyPrivateRoute;
