import "./arena/base.css";
import "./arena/menu.css";
import "./arena/game.css";
import "./arena/effects.css";
import "./arena/champion.css";
import "./arena/responsive.css";

export const metadata = {
  title: "Tic Tac Arena",
  description: "Tic tac toe with Easy, Hard and Insane AI, AI vs AI, first to 3 points, and a champion celebration.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bowlby+One&family=Outfit:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
