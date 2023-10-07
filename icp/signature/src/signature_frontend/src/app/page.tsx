'use client';

import { useBackend } from '@/hooks/useBackend';
import { uint8ArrayToHex } from '@/utils/hexUtils';

const textareaStyles = 'border-2 border-blue-100 rounded-xl w-96';
const buttonStyles = 'bg-blue-200 rounded-lg px-4 py-1';

export default function Home() {
  const { publicKey, error } = useBackend();
  return (
    <main className="flex min-h-screen flex-col items-center p-2">
      <p>
        <label htmlFor="message">Message:</label>
        <br />
        <textarea id="message" className={textareaStyles}></textarea>
        <br />
        <button id="sign" className={buttonStyles}>
          Sign
        </button>
      </p>
      <p className="pt-10">
        <label htmlFor="sha256">SHA256:</label>
        <br />
        <textarea
          id="sha256"
          rows={2}
          className={textareaStyles}
          readOnly={true}
        ></textarea>
        <br />
        <label htmlFor="public_key">Public Key:</label>
        <br />
        <textarea
          id="public_key"
          rows={2}
          className={textareaStyles}
          readOnly={true}
          value={publicKey ? uint8ArrayToHex(publicKey) : ''}
        ></textarea>{' '}
        <br />
        <label htmlFor="signature">Signature:</label>
        <br />
        <textarea
          id="signature"
          rows={3}
          className={textareaStyles}
          readOnly={true}
        ></textarea>
        <br />
        <button id="verify" className={buttonStyles}>
          Verify
        </button>
        <span id="verified"></span>
      </p>
      <p id="error" className="text-red-400">
        {error}
      </p>
    </main>
  );
}
