export const getGoogleAuthToken = (): Promise<string> => {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      console.log(token);
      resolve(token);
    });
  });
};
