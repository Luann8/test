import { Analytics } from "@vercel/analytics/react";
import "../styles/globals.css"; // Import your global styles here

export const metdata = {
  title: "Llama Chat",
  openGraph: {
    title: "Llama Chat",
    description: "Chat with Llama 2",
  },
};

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <title>Llama 2 para licenciamento ambiental</title>
        <link rel="shortcut icon" href="https://raw.githubusercontent.com/Luann8/img-private/main/OIGcg.ico?token=GHSAT0AAAAAACNFGUSLQBDOWCKS56MLTAO6ZPNEHLQ" type="image/x-icon" />
        {/* Remove the inline style */}
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}