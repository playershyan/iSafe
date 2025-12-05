import { NextRequest, NextResponse } from 'next/server';
import { unifiedSearchByName, unifiedSearchByNIC } from '@/lib/services/searchService';
import { searchSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const query = searchParams.get('query')?.trim() || '';
    const nic = searchParams.get('nic')?.trim() || '';

    // Validate input
    const validated = searchSchema.parse({ type, query, nic });

    let results;

    if (validated.type === 'nic' && validated.nic) {
      results = await unifiedSearchByNIC(validated.nic);
    } else if (validated.type === 'name' && validated.query) {
      results = await unifiedSearchByName(validated.query);
    } else {
      return NextResponse.json(
        { error: 'Invalid search parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Search API error:', error);

    if (error.name === 'ZodError') {
      const errorMessages = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation failed';
      return NextResponse.json(
        { error: 'Validation failed', details: errorMessages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Search failed', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
