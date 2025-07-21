import { NextResponse } from 'next/server';

const API_URL = `https://${process.env.API_URI || "skiiapi-638356355820.europe-west12.run.app"}`;
if (process.env.NODE_ENV === 'development') {
    console.log(`Using API_URL: ${API_URL}`);
}

export async function GET(request: Request) {
  try {
    const res = await fetch(`${API_URL}/technic_inventory`);
    
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
