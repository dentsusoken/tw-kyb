'use client';

import { useSearchParams } from 'next/navigation';

export default function Pagesess() {
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');
  var S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var N = 16;
  const params = {
    credential_issuer: window ? window.location.href : '',
    credentials: [
      {
        format: 'vc+sd-jwt',
        credential_definition: {
          type: 'IdentityCredential',
        },
      },
    ],
    grants: {
      authorization_code: {
        issuer_state: Array.from(crypto.getRandomValues(new Uint8Array(N)))
          .map((n) => S[n % S.length])
          .join(''),
      },
    },
  };

  const uriParams = encodeURIComponent(JSON.stringify(params));
  const uri = `${redirectUri}?credential_offer=${uriParams}`;

  const onClick = () => {
    const uriParams = encodeURIComponent(JSON.stringify(params));
    redirectUri &&
      window.location.replace(`${redirectUri}?credential_offer=${uriParams}`);
  };

  return (
    <main>
      <div>
        <p className="text-3xl font-bold text-blue-500 text-center">
          credential offer: {JSON.stringify(params, null, 2)}
        </p>
        <div className="flex justify-center">
          <button
            onClick={onClick}
            className="text-white bg-blue-500 p-2 inline-block rounded-lg"
          >
            Redirect
          </button>
        </div>
      </div>
    </main>
  );
}
