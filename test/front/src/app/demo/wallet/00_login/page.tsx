'use client';

import LoginButton from '@/components/demo/LoginButton';
import LoginHeader from '@/components/demo/LoginHeader';
import PageTitle from '@/components/demo/PageTitle';
import { useLocale } from '@/hooks/useLocale';

export default function Pagesess() {
  const { t } = useLocale();
  return (
    <>
      {/* <LoginHeader /> */}
      <main>
        <PageTitle title={t.PAGES['LOGIN'].TITLE} />
        <div className="w-fit mx-auto pt-[113px] flex flex-col gap-8">
          <LoginButton type="google" />
          <LoginButton type="webAuth" />
        </div>
      </main>
    </>
  );
}
