import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Worldforge', description: 'A living grand-strategy world simulator.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
