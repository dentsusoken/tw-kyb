import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

let authLock: boolean = false;

export const openAuthSessionAsync = async (
  url: string,
  redirectUri: string,
): Promise<{ type: string; url?: string }> => {
  if (authLock) {
    return { type: 'locked' };
  }

  authLock = true;

  let result: WebBrowser.WebBrowserAuthSessionResult;
  try {
    result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
  } finally {
    authLock = false;
  }

  return result;
};
