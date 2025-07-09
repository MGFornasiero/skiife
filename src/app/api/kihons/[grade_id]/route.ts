import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { grade_id: string } }
) {
  const { grade_id } = params;

  if (!grade_id) {
    return NextResponse.json({ error: 'Missing grade_id' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://skiiapi-638356355820.europe-west12.run.app/kihons/${grade_id}`);
    
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
