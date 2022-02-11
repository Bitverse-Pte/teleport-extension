export const isValidHexString = (str: string) =>
  /^(0x|0X)?[a-fA-F0-9]+$/.test(str);
