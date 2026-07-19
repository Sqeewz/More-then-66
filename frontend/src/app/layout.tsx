import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'mt66.cc | Web Game Aggregator & Framing Platform',
  description: 'Discover, frame, and play user-submitted web games, HTML5 & WebGL titles from across the indie ecosystem.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col bg-[#0b0d14]">
          {children}
        </div>
      </body>
    </html>
  );
}
