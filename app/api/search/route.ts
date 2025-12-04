import { NextRequest, NextResponse } from 'next/server';
import { searchByName, searchByNIC } from '@/lib/services/searchService';
import { searchSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const query = searchParams.get('query');
    const nic = searchParams.get('nic');

    // Validate input
    const validated = searchSchema.parse({ type, query, nic });

    let results;

    if (validated.type === 'nic' && nic) {
      results = await searchByNIC(nic);
    } else if (validated.type === 'name' && query) {
      results = await searchByName(query);
    } else {
      return NextResponse.json(
        { error: 'Invalid search parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
