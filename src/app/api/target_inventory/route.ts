import { NextResponse } from 'next/server';

const API_URL = "https://skiiapi-638356355820.europe-west12.run.app";

export async function GET(request: Request) {
  try {
    const res = await fetch(`${API_URL}/target_inventory`);
    
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
