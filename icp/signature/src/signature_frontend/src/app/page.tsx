'use client';

import { useHome } from '@/hooks/useHome';
import { uint8ArrayToHex } from '@/utils/hexUtils';

const textareaStyles = 'border-2 border-blue-100 rounded-xl w-96';
const buttonStyles = 'bg-blue-200 rounded-lg px-4 py-1';

export default function Home() {
  const {
    publicKey,
    hash,
    signature,
    verifyMessage,
    onMessageChange,
    onSignClick,
    onVerifyClick,
    error,
  } = useHome();
  return (
    <main className="flex min-h-screen flex-col items-center p-2">
      <p className="pt-4">
        <label htmlFor="message">Message:</label>
        <br />
        <textarea
          id="message"
          className={textareaStyles}
          onChange={onMessageChange}
        ></textarea>
        <br />
        <label htmlFor="sha256">SHA256:</label>
        <br />
        <textarea
          rows={2}
          className={textareaStyles}
          readOnly={true}
          value={hash ? uint8ArrayToHex(hash) : ''}
        ></textarea>
        <br />
        <button id="sign" className={buttonStyles} onClick={onSignClick}>
          Sign
        </button>
      </p>
      <p className="pt-10">
        <label htmlFor="public_key">Public Key:</label>
        <br />
        <textarea
          rows={2}
          className={textareaStyles}
          readOnly={true}
          value={publicKey ? uint8ArrayToHex(publicKey) : ''}
        ></textarea>
        <br />
        <label htmlFor="signature">Signature:</label>
        <br />
        <textarea
          rows={4}
          className={textareaStyles}
          readOnly={true}
          value={signature ? uint8ArrayToHex(signature) : ''}
        ></textarea>
        <br />
        <button id="verify" className={buttonStyles} onClick={onVerifyClick}>
          Verify
        </button>
        <span className="pl-2">{verifyMessage}</span>
      </p>
      <p className="text-red-400">{error}</p>
    </main>
  );
}
