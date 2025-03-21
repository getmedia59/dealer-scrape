import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { firecrawlClient, CrawlConfig, CrawlResponse } from '@/lib/firecrawl/client';

// Make sure the API key is available
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealerId = params.id;
    console.log(`Starting scrape for dealer ${dealerId}`);
    
    // Check if Firecrawl API key is available
    if (!FIRECRAWL_API_KEY) {
      console.error('Firecrawl API key not found in environment variables');
      return NextResponse.json(
        { error: 'Firecrawl API key not configured', details: 'The API key is missing in the environment configuration' },
        { status: 500 }
      );
    }
    
    // Get request body
    let body = {} as { config?: CrawlConfig };
    
    try {
      const bodyText = await request.text();
      console.log('Request body text:', bodyText);
      
      if (bodyText) {
        body = JSON.parse(bodyText);
      }
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body', details: error instanceof Error ? error.message : 'Unknown parse error' },
        { status: 400 }
      );
    }
    
    const { config = {} } = body;
    console.log('Scrape config:', config);

    // Get the supabase client
    const supabase = createClient();
    
    // Get dealer information from database
    console.log('Fetching dealer info from database...');
    const { data: dealer, error } = await supabase
      .from('dealers')
      .select('*')
      .eq('id', dealerId)
      .single();
    
    if (error) {
      console.error('Error fetching dealer:', error);
      return NextResponse.json(
        { error: 'Dealer not found', details: error.message },
        { status: 404 }
      );
    }
    
    console.log('Found dealer:', dealer.name);
    
    // Make sure the dealer has a website_url
    if (!dealer.website_url) {
      console.error('Dealer has no website URL configured');
      return NextResponse.json(
        { error: 'Dealer has no website URL configured' },
        { status: 400 }
      );
    }
    
    // Prepare the crawl configuration with selectors for vehicle data
    const crawlConfig: CrawlConfig = {
      limit: config.limit || 100,
      scrapeOptions: {
        formats: ["html", "markdown"],
        ...config.scrapeOptions
      },
      selectors: {
        vehicleContainer: '.vehicle-card, .vehicle-listing, .inventory-item',
        make: '.vehicle-make, .make',
        model: '.vehicle-model, .model',
        year: '.vehicle-year, .year',
        price: '.vehicle-price, .price',
        mileage: '.vehicle-mileage, .mileage',
        vin: '.vehicle-vin, .vin',
        imageUrl: 'img.vehicle-image, .vehicle-photo img',
        url: 'a.vehicle-link, .vehicle-details-link'
      },
      options: {
        scrollToBottom: true,
        maxScrolls: 5,
        delay: 1000
      }
    };

    // Trigger the crawl
    console.log(`Crawling ${dealer.website_url} for dealer ${dealerId}`);
    
    try {
      const result: CrawlResponse = await firecrawlClient.crawlUrl(
        dealerId,
        dealer.website_url,
        crawlConfig
      );
      
      if (!result.success) {
        console.error('Crawl failed:', result.message);
        return NextResponse.json(
          { error: result.message },
          { status: 500 }
        );
      }
      
      console.log('Crawl successful, found', result.data.vehicles.length, 'vehicles');
      
      // If successful, update the dealer's last_scraped timestamp
      console.log('Updating dealer record with new scraped data...');
      const { error: updateError } = await supabase
        .from('dealers')
        .update({
          last_scraped: new Date().toISOString(),
          vehicle_count: result.data.vehicles.length
        })
        .eq('id', dealerId);
        
      if (updateError) {
        console.error('Error updating dealer record:', updateError);
      }
      
      // Return the result
      return NextResponse.json(result);
    } catch (crawlError) {
      console.error('Error during crawl operation:', crawlError);
      
      // Return a formatted error response
      return NextResponse.json(
        { 
          error: 'Crawl operation failed', 
          details: crawlError instanceof Error ? crawlError.message : 'Unknown crawl error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in scrape API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scrape dealer website', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch previous scrape results
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const dealerId = context.params.id;
    console.log(`Fetching scrape results for dealer ${dealerId}`);
    
    // Get the dealer information
    const supabase = createClient();
    const { data: dealer, error } = await supabase
      .from('dealers')
      .select('*')
      .eq('id', dealerId)
      .single();
    
    if (error) {
      console.error('Error fetching dealer for GET:', error);
      return NextResponse.json(
        { error: 'Dealer not found', details: error.message },
        { status: 404 }
      );
    }
    
    // For now, return basic info - in the future we'll include a list of past crawls
    return NextResponse.json({
      dealer: {
        id: dealer.id,
        name: dealer.name,
        website_url: dealer.website_url,
        last_scraped: dealer.last_scraped,
        vehicle_count: dealer.vehicle_count
      }
    });
  } catch (error) {
    console.error('Error in GET scrape API:', error);
    return NextResponse.json(
      { error: 'Failed to get scrape information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 