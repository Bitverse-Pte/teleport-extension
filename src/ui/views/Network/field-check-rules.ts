export const checkIsLegitURL = (value: string) => {
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    throw new Error("Bad URL provided. URL must start with 'http(s)://'");
  }
  if (
    !/^http[s]*:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9][a-zA-Z0-9-_/.?=]*/.test(
      value
    )
  ) {
    throw new Error('Bad URL provided. is it a valid domain?');
  }
};

export const checkIsTrimmed = (value: string) => {
  if (value.trim() !== value) {
    throw new Error("It can't start or end with space character.");
  }
};
