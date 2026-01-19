import { Share_Tech_Mono } from "next/font/google";
import React from "react";

const textStyle = Share_Tech_Mono({ weight: "400", subsets: ["latin"] });

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={textStyle.className}>{children}</section>;
}
