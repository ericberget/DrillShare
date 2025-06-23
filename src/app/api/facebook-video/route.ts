import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { videoUrl } = await request.json();

  if (!videoUrl) {
    return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const clientToken = process.env.FACEBOOK_CLIENT_TOKEN;

  if (!appId || !clientToken) {
    console.error('Facebook App ID or Client Token is not configured.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const accessToken = `${appId}|${clientToken}`;
  const apiUrl = `https://graph.facebook.com/v20.0/oembed_video?url=${encodeURIComponent(videoUrl)}&access_token=${accessToken}&fields=thumbnail_url`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        thumbnailUrl: data.thumbnail_url,
      });
    } else {
      console.error('Facebook API error:', data);
      return NextResponse.json({ error: data.error?.message || 'Failed to fetch video data' }, { status: response.status });
    }
  } catch (error) {
    console.error('Error fetching from Facebook oEmbed API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 