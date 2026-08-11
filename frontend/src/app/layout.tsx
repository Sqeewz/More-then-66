import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'More Then 66 — CS67 Game Hub',
  description: 'คลังผลงานเกม วิทยาการคอมพิวเตอร์ รุ่น 67',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col bg-[#050814]">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

