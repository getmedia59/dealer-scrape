"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface ScrapeButtonProps {
  dealerId: string;
  onSuccess?: () => void;
}

export default function ScrapeButton({ dealerId, onSuccess }: ScrapeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const supabase = createClient();

  const handleScrape = async () => {
    try {
      setIsLoading(true);
      setLoadingStatus('Initializing scrape job...');
      console.log('Starting scrape for dealer:', dealerId);
      
      // Create a scrape job in the database
      const { data: jobData, error: jobError } = await supabase
        .from('scrape_jobs')
        .insert({
          dealer_id: dealerId,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select();

      if (jobError) {
        console.error('Error creating scrape job:', jobError);
        throw jobError;
      }
      
      const jobId = jobData?.[0]?.id;
      console.log('Scrape job created:', jobData);
      
      // Call the API with error handling
      setLoadingStatus('Contacting Firecrawl API...');
      console.log('Calling scrape API endpoint...');
      try {
        const response = await fetch(`/api/dealers/${dealerId}/scrape`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: {
              limit: 100,
              scrapeOptions: {
                formats: ["markdown"]
              }
            }
          })
        });

        // Log the response status
        console.log('API response status:', response.status);
        
        // Get the response body as text first to debug
        const responseText = await response.text();
        console.log('API response text:', responseText);
        
        // Parse the JSON if possible
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          throw new Error(`Invalid API response: ${responseText}`);
        }

        if (!response.ok) {
          // Update the job status to failed in the database
          if (jobId) {
            await supabase
              .from('scrape_jobs')
              .update({
                status: 'failed',
                error_message: result.error || `API error: ${response.status}`,
                completed_at: new Date().toISOString()
              })
              .eq('id', jobId);
          }
          
          throw new Error(result.error || `API error: ${response.status}`);
        }

        console.log('Scrape result:', result);
        
        // Show notification about successful scrape
        const vehicleCount = result.data.vehicles.length;
        toast({
          title: "Scrape successful",
          description: `Found ${vehicleCount} vehicle${vehicleCount === 1 ? '' : 's'}. Data saved to file.`,
        });
        
        // Update the job status based on the result
        if (jobId) {
          const { error: updateError } = await supabase
            .from('scrape_jobs')
            .update({
              status: 'completed',
              result_data: result,
              completed_at: new Date().toISOString()
            })
            .eq('id', jobId);
            
          if (updateError) {
            console.error('Error updating scrape job:', updateError);
          }
        }

        if (onSuccess) {
          onSuccess();
        }
      } catch (fetchError: unknown) {
        console.error('Fetch error details:', fetchError);
        
        // Update the job status to failed
        if (jobId) {
          try {
            await supabase
              .from('scrape_jobs')
              .update({
                status: 'failed',
                error_message: fetchError instanceof Error ? fetchError.message : 'Network error',
                completed_at: new Date().toISOString()
              })
              .eq('id', jobId);
          } catch (dbError) {
            console.error('Error updating scrape job status after fetch error:', dbError);
          }
        }
        
        // Handle specific fetch errors
        if (fetchError instanceof Error) {
          throw fetchError;
        } else {
          throw new Error('Network error - Could not connect to the API');
        }
      }
      
    } catch (error) {
      console.error('Error starting scrape job:', error);
      
      // Show error notification
      toast({
        title: "Scrape failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      
      // Capture more detailed error information
      const errorMessage = error instanceof Error 
        ? error.message 
        : JSON.stringify(error) || 'Unknown error';
      
      console.error('Detailed error:', errorMessage);
        
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <Button 
      onClick={handleScrape} 
      size="icon" 
      variant="ghost"
      disabled={isLoading}
      title={isLoading ? loadingStatus : "Scrape dealer website"}
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      <span className="sr-only">{isLoading ? loadingStatus : "Scrape"}</span>
    </Button>
  );
} 