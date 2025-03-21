"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ScrapeButtonProps {
  dealerId: string;
  dealerName: string;
  onScrapeComplete?: () => void;
}

export default function ScrapeButton({ dealerId, dealerName, onScrapeComplete }: ScrapeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleScrape = async () => {
    try {
      setIsLoading(true);
      
      // Create a scrape job in the database
      const { error } = await supabase
        .from('scrape_jobs')
        .insert({
          dealer_id: dealerId,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Here you would typically trigger the actual scraping process
      // This could be via a serverless function, API call, etc.
      
      // For now, we'll simulate a successful scrape after a short delay
      setTimeout(() => {
        setIsLoading(false);
        if (onScrapeComplete) {
          onScrapeComplete();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error starting scrape job:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleScrape} 
      size="sm" 
      variant="outline"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Scraping...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Scrape
        </>
      )}
    </Button>
  );
} 