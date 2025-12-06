/**
 * API Route: Get Administrative Divisions
 * GET /api/compensation/divisions
 *
 * Public route - used for form dropdowns
 * Query params:
 * - type: 'districts' | 'secretariats' | 'gn_divisions'
 * - district: (required for secretariats and gn_divisions)
 * - divisionalSecretariat: (required for gn_divisions)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getDistricts,
  getDivisionalSecretariats,
  getGramaNiladhariDivisions,
} from '@/lib/services/compensationService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const district = searchParams.get('district');
    const divisionalSecretariat = searchParams.get('divisionalSecretariat');

    if (!type) {
      return NextResponse.json(
        { error: 'Type parameter is required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'districts': {
        const { success, districts, error } = await getDistricts();
        if (!success) {
          return NextResponse.json({ error }, { status: 500 });
        }
        return NextResponse.json({ success: true, data: districts });
      }

      case 'secretariats': {
        if (!district) {
          return NextResponse.json(
            { error: 'District parameter is required' },
            { status: 400 }
          );
        }
        const { success, secretariats, error } = await getDivisionalSecretariats(district);
        if (!success) {
          return NextResponse.json({ error }, { status: 500 });
        }
        return NextResponse.json({ success: true, data: secretariats });
      }

      case 'gn_divisions': {
        if (!district || !divisionalSecretariat) {
          return NextResponse.json(
            { error: 'District and divisionalSecretariat parameters are required' },
            { status: 400 }
          );
        }
        const { success, divisions, error } = await getGramaNiladhariDivisions(
          district,
          divisionalSecretariat
        );
        if (!success) {
          return NextResponse.json({ error }, { status: 500 });
        }
        return NextResponse.json({ success: true, data: divisions });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching divisions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
