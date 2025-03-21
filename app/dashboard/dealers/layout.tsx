import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dealers | Vehicle Marketplace Scraping Service",
  description: "Manage dealer information for web scraping",
};

export default function DealersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 