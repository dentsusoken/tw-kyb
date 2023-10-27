'use client';

import {
  createUserWithPasskey,
  signInWithPasskey,
} from '@firebase-web-authn/browser';
import { auth, functions } from '../../../firebaseConfig';
import { UserCredential } from 'firebase/auth';
import { FormEvent, useState } from 'react';

export default function Pagesess() {
  const [name, setName] = useState('');
  const [user, setUser] = useState<UserCredential | undefined>();

  const signUp = async () => {
    const cred =
      auth && functions && (await createUserWithPasskey(auth, functions, name));
    setUser(cred);
    console.log('user :>> ', user);
  };

  const signIn = async () => {
    const cred =
      auth && functions && (await signInWithPasskey(auth, functions));
    setUser(cred);
    console.log('user :>> ', user);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    name !== '' && signUp();
  };

  return (
    <main className="tracking-wide h-screen pt-12 bg-blue-500">
      <div className="flex flex-col gap-6 w-80 h-1/2 mx-auto px-2 rounded bg-white shadow-lg">
        <h1 className="mt-4 text-3xl font-bold text-blue-500 text-center">
          Login
        </h1>
        <hr />
        <form onSubmit={(e) => onSubmit(e)}>
          <div className="bg-blue-500 px-2 py-4 rounded">
            <p className="font-bold mb-4 text-white">Sign up with Passkey</p>
            <div className="group/text relative bg-inherit">
              <input
                id="name"
                type="text"
                className="
              peer w-full h-12 py-2 pl-2 pr-12 border border-white rounded bg-transparent
              focus:outline-none focus:border-2 focus:border-yellow-400
              "
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder=" "
                autoComplete="off"
                autoCapitalize="off"
              />
              <label
                htmlFor="name"
                className="
              absolute -top-3 left-2 text-sm bg-inherit text-white 
              peer-placeholder-shown:top-1/4 peer-placeholder-shown:text-base 
              peer-focus:-top-3 peer-focus:text-sm peer-focus:text-yellow-400
              "
              >
                User Name
              </label>
              <button
                onClick={signUp}
                className="absolute right-2 w-10 h-10 top-1 text-white bg-orange-400 p-2 rounded-full disabled:bg-gray-400 hover:bg-orange-600"
                disabled={name !== '' ? false : true}
              >
                <div className="w-4 h-4 border-t-4 border-r-4 border-white-500 rotate-45"></div>
              </button>
            </div>
          </div>
        </form>
        <div className="flex flex-col gap-2">
          <button
            onClick={signIn}
            className="text-white bg-blue-500 p-2 inline-block rounded-lg hover:bg-blue-700"
          >
            Sign in with Passkey
          </button>
        </div>
      </div>
    </main>
  );
}
