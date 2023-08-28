import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test',
  description: 'Test',
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
