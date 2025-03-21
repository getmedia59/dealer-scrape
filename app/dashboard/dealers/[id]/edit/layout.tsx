import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Dealer | Vehicle Marketplace Scraping Service",
  description: "Update dealer information",
};

export default function EditDealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 