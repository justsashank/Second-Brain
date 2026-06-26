import "./globals.css";

export const metadata = {
  title: "Second Brain",
  description: "AI Knowledge System",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">

      <body>

        {children}

      </body>

    </html>
  );
}