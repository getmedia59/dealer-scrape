import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { firecrawlClient, CrawlConfig } from '@/lib/firecrawl/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealerId = params.id;
    
    // Get request body
    const body = await request.json();
    const { config = {} } = body as { config?: CrawlConfig };

    // Get the supabase client
    const supabase = createClient();
    
    // Get dealer information from database
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
    
    // Make sure the dealer has a website_url
    if (!dealer.website_url) {
      return NextResponse.json(
        { error: 'Dealer has no website URL configured' },
        { status: 400 }
      );
    }
    
    // Trigger the crawl
    const result = await firecrawlClient.crawlUrl(
      dealerId,
      dealer.website_url,
      config
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
    
    // If successful, update the dealer's last_scraped timestamp
    await supabase
      .from('dealers')
      .update({
        last_scraped: new Date().toISOString(),
        vehicle_count: result.data.vehicles.length
      })
      .eq('id', dealerId);
    
    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in scrape API:', error);
    return NextResponse.json(
      { error: 'Failed to scrape dealer website', details: error instanceof Error ? error.message : 'Unknown error' },
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
    
    // Get the dealer information
    const supabase = createClient();
    const { data: dealer, error } = await supabase
      .from('dealers')
      .select('*')
      .eq('id', dealerId)
      .single();
    
    if (error) {
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
      { error: 'Failed to get scrape information' },
      { status: 500 }
    );
  }
} 