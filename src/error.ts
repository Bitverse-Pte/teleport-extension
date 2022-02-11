import { ErrorCode } from 'constants/code';

export default class BitError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode = ErrorCode.DEFAULT, msg?: string) {
    super();
    this.code = code;
  }
}
