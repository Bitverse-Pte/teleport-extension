declare module '*.json' {
  const value: any;
  export default value;
}

import 'react-redux';
import { RootState } from './ui/reducer';
declare module 'react-redux' {
  interface DefaultRootState extends RootState {}
}
