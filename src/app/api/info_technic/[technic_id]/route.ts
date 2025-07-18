import { NextResponse } from 'next/server';

const API_URL = "https://skiiapi-638356355820.europe-west12.run.app";

export async function GET(
  request: Request,
  { params }: { params: { technic_id: string } }
) {
  const { technic_id } = params;

  if (!technic_id) {
    return NextResponse.json({ error: 'Missing technic_id' }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/info_technic/${technic_id}`);
    
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
