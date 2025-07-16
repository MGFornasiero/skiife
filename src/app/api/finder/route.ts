import { NextResponse } from 'next/server';

const API_URL = "https://skiiapi-638356355820.europe-west12.run.app";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { search } = body;

    if (!search) {
      return NextResponse.json({ error: 'Search text is required' }, { status: 400 });
    }

    const res = await fetch(`${API_URL}/finder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ search }),
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
