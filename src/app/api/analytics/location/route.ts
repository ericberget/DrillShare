import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '8.8.8.8'; // Fallback to a default IP

    if (!ip) {
      return NextResponse.json({ error: 'Could not determine IP address' }, { status: 400 });
    }

    // Use a free IP geolocation service
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('IP Geolocation API error:', errorText);
      return NextResponse.json({ 
        error: `Geolocation service failed with status: ${response.status}`,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();

    if (data.error) {
        console.error('IP Geolocation API returned an error:', data.reason);
        return NextResponse.json({ 
            city: 'Unknown', 
            country: 'Unknown', 
            ip,
            warning: data.reason 
        });
    }

    const { city, country_name: country } = data;

    return NextResponse.json({ city, country, ip });
  } catch (error) {
    console.error('Error in location API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 