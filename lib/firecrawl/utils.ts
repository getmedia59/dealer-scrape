import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Define vehicle data structure
export interface Vehicle {
  id?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  vin: string;
  imageUrl: string;
  url: string;
  // Additional optional fields
  exteriorColor?: string;
  interiorColor?: string;
  features?: string[];
}

// Define the structure for crawl results
export interface CrawlResult {
  vehicles: Vehicle[];
  metadata?: {
    dealerName?: string;
    totalFound?: number;
    website?: string;
    crawlDate?: string;
    crawlDuration?: number;
  };
}

/**
 * Save crawl results to a JSON file
 * @param dealerId The dealer ID
 * @param data The crawl result data to save
 * @returns A promise that resolves to the file path
 */
export async function saveCrawlResultToFile(
  dealerId: string,
  data: CrawlResult
): Promise<string> {
  // Ensure vehicles have IDs
  const vehiclesWithIds = data.vehicles.map(vehicle => ({
    ...vehicle,
    id: vehicle.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }));

  // Include metadata if not present
  const resultWithMetadata: CrawlResult = {
    vehicles: vehiclesWithIds,
    metadata: data.metadata || {
      crawlDate: new Date().toISOString(),
      totalFound: vehiclesWithIds.length,
    }
  };

  try {
    // Create directory structure if it doesn't exist
    const dir = path.join(process.cwd(), 'data', 'crawls', dealerId);
    await fsPromises.mkdir(dir, { recursive: true });

    // Create a filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `crawl-${timestamp}.json`;
    const filepath = path.join(dir, filename);

    // Write the data to the file
    await fsPromises.writeFile(
      filepath,
      JSON.stringify(resultWithMetadata, null, 2)
    );

    console.log(`Saved crawl result to ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('Error saving crawl result to file:', error);
    throw error;
  }
}

/**
 * Load a specific crawl result for a dealer
 * @param dealerId The dealer ID
 * @param filename The crawl result filename
 * @returns A promise that resolves to the crawl result
 */
export async function loadCrawlResult(
  dealerId: string,
  filename: string
): Promise<CrawlResult> {
  try {
    const filepath = path.join(process.cwd(), 'data', 'crawls', dealerId, filename);
    const data = await fsPromises.readFile(filepath, 'utf-8');
    return JSON.parse(data) as CrawlResult;
  } catch (error) {
    console.error(`Error loading crawl result from ${filename}:`, error);
    throw error;
  }
}

/**
 * Load all crawl results for a dealer
 * @param dealerId The dealer ID
 * @returns A promise that resolves to an array of crawl results
 */
export async function loadCrawlResults(
  dealerId: string
): Promise<CrawlResult[]> {
  try {
    const dir = path.join(process.cwd(), 'data', 'crawls', dealerId);
    
    // Check if the directory exists
    try {
      await fsPromises.access(dir);
    } catch (error) {
      // Directory doesn't exist, return empty array
      return [];
    }
    
    // Get all JSON files in the directory
    const files = await fsPromises.readdir(dir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Load each file
    const results = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          return await loadCrawlResult(dealerId, file);
        } catch (error) {
          console.error(`Error loading ${file}:`, error);
          return null;
        }
      })
    );
    
    // Filter out any null results
    return results.filter((result): result is CrawlResult => result !== null);
  } catch (error) {
    console.error(`Error loading crawl results for dealer ${dealerId}:`, error);
    return [];
  }
}

/**
 * Get the latest crawl result for a dealer
 * @param dealerId The dealer ID
 * @returns A promise that resolves to the latest crawl result or null if none exists
 */
export async function getLatestCrawlResult(
  dealerId: string
): Promise<CrawlResult | null> {
  try {
    const results = await loadCrawlResults(dealerId);
    
    if (results.length === 0) {
      return null;
    }
    
    // Sort by crawl date (most recent first)
    results.sort((a, b) => {
      const dateA = a.metadata?.crawlDate ? new Date(a.metadata.crawlDate).getTime() : 0;
      const dateB = b.metadata?.crawlDate ? new Date(b.metadata.crawlDate).getTime() : 0;
      return dateB - dateA;
    });
    
    return results[0];
  } catch (error) {
    console.error(`Error getting latest crawl result for dealer ${dealerId}:`, error);
    return null;
  }
}

/**
 * Load a saved crawl result from a JSON file
 */
export async function loadCrawlResultFromFile(filepath: string): Promise<CrawlResult> {
  const data = await fs.promises.readFile(filepath, 'utf-8');
  return JSON.parse(data) as CrawlResult;
}

/**
 * Get all saved crawl results for a dealer
 */
export async function getDealerCrawlResults(dealerId: string): Promise<string[]> {
  const dir = path.join(process.cwd(), 'data', 'crawls');
  
  try {
    // Create directory if it doesn't exist
    await fs.promises.mkdir(dir, { recursive: true });
    
    // Get all files in the directory
    const files = await fs.promises.readdir(dir);
    
    // Filter for files matching this dealer ID
    return files
      .filter(file => file.startsWith(`${dealerId}_`) && file.endsWith('.json'))
      .map(file => path.join(dir, file));
  } catch (error) {
    console.error('Error getting dealer crawl results:', error);
    return [];
  }
} 