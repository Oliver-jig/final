import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ding Ding Cat Sticker Generator',
  description: 'Generate adorable Ding Ding Cat festival stickers with AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
