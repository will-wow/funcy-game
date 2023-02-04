import { Roboto_Flex } from "@next/font/google";
import "~/globals.css";

const font = Roboto_Flex({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={font.className}>
      <body className="overflow-y-scroll">{children}</body>
    </html>
  );
}
