import { CrawlResult, Vehicle, saveCrawlResultToFile, loadCrawlResults } from './utils';
import fs from 'fs/promises';
import path from 'path';
import FirecrawlApp, { CrawlStatusResponse, ErrorResponse } from '@mendable/firecrawl-js';

// Firecrawl API key from environment
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-75a2b4cc678643d289003da89c947da8';

// Define the configuration structure for a crawl
export interface CrawlConfig {
  limit?: number;
  scrapeOptions?: {
    formats?: string[];
  };
  selectors?: {
    vehicleContainer?: string;
    make?: string;
    model?: string;
    year?: string;
    price?: string;
    mileage?: string;
    vin?: string;
    imageUrl?: string;
    url?: string;
  };
  options?: {
    waitForSelector?: string;
    scrollToBottom?: boolean;
    maxScrolls?: number;
    delay?: number;
    maxItems?: number;
  };
}

// Define the response type for the crawlUrl method
export interface CrawlResponse {
  success: boolean;
  message: string;
  data: CrawlResult;
}

// FirecrawlApp implementation using the official package
class FirecrawlClient {
  private client: FirecrawlApp;

  constructor(config: { apiKey: string }) {
    this.client = new FirecrawlApp({ apiKey: config.apiKey });
  }

  /**
   * Crawl a URL using the Firecrawl service
   * @param url The URL to crawl
   * @param options The options for the crawl
   * @returns The crawl result
   */
  async crawlUrl(url: string, options?: any): Promise<any> {
    console.log(`Crawling URL with Firecrawl: ${url}`);

    try {
      // Start the crawl job
      const crawlResponse = await this.client.asyncCrawlUrl(url, {
        ...options,
        scrapeOptions: {
          formats: ["html", "markdown"],
          ...options?.scrapeOptions
        }
      });

      if (!crawlResponse.success || !crawlResponse.id) {
        throw new Error(`Failed to start crawl: ${crawlResponse.error || 'Unknown error'}`);
      }

      console.log(`Crawl job started with ID: ${crawlResponse.id}`);

      // Poll for completion
      let status: CrawlStatusResponse | ErrorResponse;
      do {
        // Wait 2 seconds between checks
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        status = await this.client.checkCrawlStatus(crawlResponse.id);
        
        if ('error' in status) {
          throw new Error(`Crawl check failed: ${status.error}`);
        }
        
        console.log(`Crawl status: ${status.status}, completed: ${status.completed}/${status.total}`);
        
      } while (status.status === 'scraping');

      if (status.status === 'failed') {
        throw new Error('Crawl failed');
      }

      return status;
    } catch (error) {
      console.error('Error in Firecrawl crawlUrl:', error);
      throw error;
    }
  }
}

// The Firecrawl client for interacting with the crawling service
export const firecrawlClient = {
  /**
   * Crawl a dealer website and extract vehicle information
   * @param dealerId The dealer ID
   * @param url The URL to crawl
   * @param config The configuration for the crawl
   * @returns A promise that resolves to the crawl result
   */
  async crawlUrl(
    dealerId: string,
    url: string,
    config: CrawlConfig = {}
  ): Promise<CrawlResponse> {
    console.log(`Crawling ${url} for dealer ${dealerId}`);

    try {
      // Check if API key is available
      if (!FIRECRAWL_API_KEY) {
        throw new Error('Firecrawl API key is not configured. Please check your environment variables.');
      }

      // Create data directory if it doesn't exist
      const dataDir = path.join(process.cwd(), 'data', 'crawls');
      await fs.mkdir(dataDir, { recursive: true });
      
      // Initialize the Firecrawl client
      const client = new FirecrawlClient({ apiKey: FIRECRAWL_API_KEY });
      
      // Use the Firecrawl API as shown in the example
      console.log('Making request to Firecrawl API...');
      
      try {
        // Create a crawl configuration based on our config object
        const crawlOptions = {
          limit: config.limit || 100,
          scrapeOptions: {
            formats: ["html", "markdown"],
            ...config.scrapeOptions
          }
        };
        
        // Call the Firecrawl API
        const apiResult = await client.crawlUrl(url, crawlOptions);
        console.log('Firecrawl API response received');
        
        // Transform to our internal format
        const vehicles: Vehicle[] = [];
        
        // Process the crawl result based on the structure returned by Firecrawl
        if (apiResult.data && Array.isArray(apiResult.data)) {
          apiResult.data.forEach((doc: any) => {
            try {
              // Extract vehicle data from the HTML/markdown content
              // This is a simplified example - you'll need to adjust based on the actual structure
              const vehicle: Vehicle = {
                make: doc.extract?.make || 'Unknown',
                model: doc.extract?.model || 'Unknown',
                year: parseInt(doc.extract?.year) || 0,
                price: parseFloat(doc.extract?.price?.replace(/[$,]/g, '')) || 0,
                mileage: parseInt(doc.extract?.mileage?.replace(/[,]/g, '')) || 0,
                vin: doc.extract?.vin || '',
                imageUrl: doc.extract?.imageUrl || '',
                url: doc.url || ''
              };
              vehicles.push(vehicle);
            } catch (error) {
              console.error('Error processing vehicle data:', error);
            }
          });
        }
        
        const result: CrawlResult = {
          vehicles,
          metadata: {
            dealerName: '',  // We'll need to extract this from the page if needed
            totalFound: vehicles.length,
            website: url,
            crawlDate: new Date().toISOString(),
            crawlDuration: 0  // This information might not be available
          }
        };
        
        // Save to a file
        await this.saveResultToFile(dealerId, result);
        
        return {
          success: true,
          message: 'Crawl completed successfully',
          data: result
        };
      } catch (fetchError: unknown) {
        // Handle specific fetch errors
        if (fetchError instanceof Error) {
          throw fetchError;
        } else {
          throw new Error(`Unknown error connecting to Firecrawl API: ${String(fetchError)}`);
        }
      }
    } catch (error) {
      console.error('Error crawling URL:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        data: { vehicles: [] }
      };
    }
  },
  
  /**
   * Save crawl results to a file using the dealer name
   * @param dealerId The dealer ID
   * @param result The crawl result to save
   */
  async saveResultToFile(dealerId: string, result: CrawlResult): Promise<string> {
    try {
      // Create directory structure if it doesn't exist
      const dir = path.join(process.cwd(), 'data', 'crawls');
      await fs.mkdir(dir, { recursive: true });
      
      // Create a filename with dealerId and timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `dealer-${dealerId}-${timestamp}.json`;
      const filepath = path.join(dir, filename);
      
      // Write the data to the file
      await fs.writeFile(
        filepath,
        JSON.stringify(result, null, 2)
      );
      
      console.log(`Saved crawl result to ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Error saving crawl result to file:', error);
      throw error;
    }
  },

  /**
   * Get all crawl results for a dealer
   * @param dealerId The dealer ID
   * @returns A promise that resolves to an array of crawl results
   */
  async getDealerCrawlResults(dealerId: string): Promise<CrawlResponse[]> {
    try {
      const dir = path.join(process.cwd(), 'data', 'crawls');
      
      // Create directory if it doesn't exist
      await fs.mkdir(dir, { recursive: true });
      
      // Get all files in the directory
      const files = await fs.readdir(dir);
      
      // Filter for files matching this dealer ID
      const dealerFiles = files.filter(file => file.includes(`dealer-${dealerId}`));
      
      // Read and parse each file
      const results = await Promise.all(
        dealerFiles.map(async (file) => {
          const filePath = path.join(dir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          try {
            const result = JSON.parse(data) as CrawlResult;
            return {
              success: true,
              message: 'Retrieved from file storage',
              data: result
            };
          } catch (error) {
            console.error(`Error parsing file ${file}:`, error);
            return null;
          }
        })
      );
      
      // Filter out any null results
      return results.filter((result): result is CrawlResponse => result !== null);
    } catch (error) {
      console.error('Error loading crawl results:', error);
      return [];
    }
  }
}; 