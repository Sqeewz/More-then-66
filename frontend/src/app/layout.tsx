import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'One 4 All — CS67 Game Hub',
  description: 'ศูนย์รวมและคลังแสดงผลงานเกม วิทยาการคอมพิวเตอร์ รุ่น 67 (One 4 All)',
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

