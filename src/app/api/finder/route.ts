import { NextResponse } from 'next/server';

const API_URL = `https://${process.env.API_URI || "skiiapi-638356355820.europe-west12.run.app"}`;
if (process.env.NODE_ENV === 'development') {
    console.log(`Using API_URL: ${API_URL}`);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (!search) {
      return NextResponse.json({ error: 'Search text is required' }, { status: 400 });
    }

    const res = await fetch(`${API_URL}/finder?search=${encodeURIComponent(search)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: `External API error: ${errorText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
