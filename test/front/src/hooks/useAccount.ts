import { useEffect, useState } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { useGroupAccount } from './useGroupAccount';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

type AccountList = {
  name: string;
  id: string;
  isGroup: boolean;
  current: boolean;
};

const accountState = atomWithStorage<AccountList>('currentAccount', {
  current: true,
  id: '',
  isGroup: false,
  name: '',
});

export const useAccount = () => {
  const [accountList, setAccontList] = useState<AccountList[]>([]);
  const [currentAccount, setCurrentAccount] = useAtom(accountState);
  const { user } = useFirebaseAuth();
  const { groupList } = useGroupAccount();

  useEffect(() => {
    const l: AccountList[] = [];
    if (user) {
      l.push({
        name: user.displayName ? user.displayName : '',
        id: user.uid,
        current: true,
        isGroup: false,
      });
      if (!currentAccount) {
        setCurrentAccount({
          name: user.displayName ? user.displayName : '',
          id: user.uid,
          current: true,
          isGroup: false,
        });
      }
    }
    groupList.forEach((v) => {
      l.push({
        name: v.name,
        id: v.id,
        current: false,
        isGroup: true,
      });
    });
    setAccontList(l);
  }, [user]);

  const changeAccount = (id: string) => {
    setAccontList(() => {
      return accountList.map((v) => {
        if (id === v.id) {
          setCurrentAccount({ ...v, current: true });
          return { ...v, current: true };
        }
        return { ...v, current: false };
      });
    });
  };

  return { accountList, currentAccount, changeAccount };
};
