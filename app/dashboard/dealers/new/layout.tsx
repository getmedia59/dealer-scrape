import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Dealer | Vehicle Marketplace Scraping Service",
  description: "Add a new dealer to the system",
};

export default function NewDealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 