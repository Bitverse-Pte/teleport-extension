import { ErrorCode } from 'consts/code';

export declare class BitError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, msg?: string);
}
