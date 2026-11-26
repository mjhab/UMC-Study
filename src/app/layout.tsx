
/* eslint-disable react-refresh/only-export-components */

import type { Metadata } from "next";
import Providers from "./providers";
import Header from "../components/layout/header";
import "../index.css";

export const metadata: Metadata = {
  title: "UMCine",
  description: "UMC 영화 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
