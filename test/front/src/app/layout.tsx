import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KYB/KYC',
  description: 'KYB/KYC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="jp">
      <body className="bg-white">{children}</body>
    </html>
  );
}
