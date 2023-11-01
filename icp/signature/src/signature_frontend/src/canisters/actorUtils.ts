import { Actor, HttpAgent, ActorSubclass } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';

export function createActor<T>(
  canisterId: string,
  interfaceFactory: IDL.InterfaceFactory
): ActorSubclass<T> {
  const isLocal = process.env.DFX_NETWORK
    ? process.env.DFX_NETWORK !== 'ic'
    : process.env.NODE_ENV !== 'production';
  const hostOptions = {
    host: isLocal ? 'http://127.0.0.1:4943' : `https://${canisterId}.ic0.app`,
  };
  const agent = new HttpAgent(hostOptions);

  if (isLocal) {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        'Unable to fetch root key. Check to ensure that your local replica is running'
      );
      console.error(err);
    });
  }

  return Actor.createActor<T>(interfaceFactory, {
    agent,
    canisterId,
  });
}
