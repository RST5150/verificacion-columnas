import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verificación de columnas",
  description: "Carga de datos de verificación de columnas de alumbrado público",
};

const themeInitScript = `
  (function () {
    try {
      var theme = localStorage.getItem('theme');
      if (!theme) theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (theme === 'dark') document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
