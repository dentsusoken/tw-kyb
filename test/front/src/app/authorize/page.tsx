'use client';

import { useSearchParams } from 'next/navigation';

export default function Pagesess() {
  const searchParams = useSearchParams();
  const responseType = searchParams.get('response_type');
  const clientId = searchParams.get('client_id');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');
  const authorizationDetails = searchParams.get('authorization_details');
  const redirectUri = searchParams.get('redirect_uri');
  const issuerState = searchParams.get('issuer_state');
  const onClick = () =>
    redirectUri &&
    window.location.replace(
      `${redirectUri}?code=1234&issuer_state=${issuerState}`
    );

  return (
    <main>
      <div>
        <p className="text-3xl font-bold text-blue-500 text-center">
          responseType: {responseType}
        </p>
        <p className="text-3xl font-bold text-blue-500 text-center">
          clientId: {clientId}
        </p>
        <p className="text-3xl font-bold text-blue-500 text-center">
          codeChallenge: {codeChallenge}
        </p>
        <p className="text-3xl font-bold text-blue-500 text-center">
          codeChallengeMethod: {codeChallengeMethod}
        </p>
        <p className="text-3xl font-bold text-blue-500 text-center">
          authorizationDetails: {authorizationDetails}
        </p>
        <p className="text-3xl font-bold text-blue-500 text-center">
          redirectUri: {redirectUri}
        </p>
        <p className="text-3xl font-bold text-blue-500 text-center">
          issuerState: {issuerState}
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
