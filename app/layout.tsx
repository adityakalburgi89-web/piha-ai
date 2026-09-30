import type { Metadata } from 'next';
import './globals.css';
import '../styles/livekit-modal.css';

export const metadata: Metadata = {
  title: 'Piha AI — Natural Multilingual Voice AI for Sales & Support',
  description:
    'Natural phone conversations for your business. Speaks English, Hindi, Kannada, and Telugu, answers questions clearly, and sends product details over WhatsApp while on call.',
  icons: {
    icon: '/images/icons/Piha.webp',
    shortcut: '/images/icons/Piha.webp',
    apple: '/images/icons/Piha.webp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}