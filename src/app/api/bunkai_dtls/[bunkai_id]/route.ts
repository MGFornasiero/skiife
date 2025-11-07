import { NextResponse } from 'next/server';

const API_URL = `https://${process.env.API_URI || "skiiapi-638356355820.europe-west12.run.app"}`;
if (process.env.NODE_ENV === 'development') {
    console.log(`Using API_URL: ${API_URL}`);
}

export async function GET(
  request: Request,
  { params }: { params: { bunkai_id: string } }
) {
  const { bunkai_id } = params;

  if (!bunkai_id) {
    return NextResponse.json({ error: 'Missing bunkai_id' }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/bunkai_dtls/${bunkai_id}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ error: errorJson.detail || `External API error: ${errorText}` }, { status: res.status });
      } catch (e) {
         return NextResponse.json({ error: `External API error: ${errorText}` }, { status: res.status });
      }
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
