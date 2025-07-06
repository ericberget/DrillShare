import { NextRequest, NextResponse } from 'next/server';

// Add dynamic route config to prevent static generation
export const dynamic = 'force-dynamic';

// Cache for location data to prevent rate limiting
const locationCache = new Map<string, any>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Helper function to get real IP address
function getRealIP(request: NextRequest): string | null {
  // Try multiple headers in order of preference
  const possibleHeaders = [
    'cf-connecting-ip', // Cloudflare
    'x-real-ip', // Nginx
    'x-forwarded-for', // Standard proxy header
    'x-client-ip', // Some proxies
    'x-forwarded', // Some proxies
    'forwarded-for', // Some proxies
    'forwarded', // Some proxies
  ];

  for (const header of possibleHeaders) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim();
      if (ip && ip !== 'unknown' && isValidIP(ip)) {
        return ip;
      }
    }
  }

  // Try Next.js built-in IP
  if (request.ip && request.ip !== 'unknown' && isValidIP(request.ip)) {
    return request.ip;
  }

  return null;
}

// Helper function to validate IP address
function isValidIP(ip: string): boolean {
  // Basic IP validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  // Don't use localhost, private, or reserved IPs
  if (ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.') || ip === '::1') {
    return false;
  }
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Multiple geolocation services as fallbacks
async function getLocationFromIP(ip: string): Promise<{ city: string; country: string; ip: string }> {
  const cacheKey = `location_${ip}`;
  const cached = locationCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached location for IP: ${ip}`);
    return cached.data;
  }

  // Try multiple services in order
  const services = [
    {
      name: 'ipapi.co',
      url: `https://ipapi.co/${ip}/json/`,
      parser: (data: any) => ({
        city: data.city || 'Unknown',
        country: data.country_name || 'Unknown',
        ip
      })
    },
    {
      name: 'ip-api.com',
      url: `http://ip-api.com/json/${ip}`,
      parser: (data: any) => ({
        city: data.city || 'Unknown',
        country: data.country || 'Unknown',
        ip
      })
    },
    {
      name: 'ipinfo.io',
      url: `https://ipinfo.io/${ip}/json`,
      parser: (data: any) => ({
        city: data.city || 'Unknown',
        country: data.country || 'Unknown',
        ip
      })
    }
  ];

  for (const service of services) {
    try {
      console.log(`Trying ${service.name} for IP: ${ip}`);
      const response = await fetch(service.url, {
        headers: {
          'User-Agent': 'DrillShare Analytics/1.0'
        },
        // Add timeout
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        console.warn(`${service.name} failed with status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.error || data.status === 'fail') {
        console.warn(`${service.name} returned error:`, data.message || data.error);
        continue;
      }

      const location = service.parser(data);
      
      // Cache the result
      locationCache.set(cacheKey, {
        data: location,
        timestamp: Date.now()
      });
      
      console.log(`Successfully got location from ${service.name}:`, location);
      return location;
      
    } catch (error) {
      console.warn(`${service.name} error:`, error);
      continue;
    }
  }

  // If all services fail, return unknown
  return { city: 'Unknown', country: 'Unknown', ip };
}

export async function GET(request: NextRequest) {
  try {
    // Get real IP address
    const realIP = getRealIP(request);
    
    // Debug information
    const debugInfo = {
      headers: {
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'x-real-ip': request.headers.get('x-real-ip'),
        'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
      },
      requestIP: request.ip,
      detectedIP: realIP,
      userAgent: request.headers.get('user-agent'),
    };
    
    console.log('Location request debug info:', debugInfo);
    
    if (!realIP) {
      console.log('No valid IP found, returning unknown location');
      return NextResponse.json({ 
        city: 'Unknown', 
        country: 'Unknown', 
        ip: 'Unknown',
        debug: debugInfo
      });
    }

    console.log(`Processing location request for IP: ${realIP}`);
    
    // Get location from IP
    const location = await getLocationFromIP(realIP);
    
    return NextResponse.json({
      ...location,
      debug: process.env.NODE_ENV === 'development' ? debugInfo : undefined
    });
    
  } catch (error) {
    console.error('Error in location API route:', error);
    return NextResponse.json({ 
      city: 'Unknown', 
      country: 'Unknown', 
      ip: 'Unknown',
      error: 'Internal server error'
    });
  }
} 