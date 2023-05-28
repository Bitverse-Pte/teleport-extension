import { getMessage } from '@extend-chrome/messages';

// getMessage returns [Function, Observable, Function]
export const [sendNumber, numberStream, waitForNumber] = getMessage(
  // String to be used as a greeting
  'NUMBER'
);
