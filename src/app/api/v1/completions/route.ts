import { NextRequest, NextResponse } from 'next/server';
import { processGatewayRequest } from '@/lib/api-gateway';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: { message: 'Missing API key', type: 'authentication_error' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.model) {
      return NextResponse.json(
        { error: { message: 'model is required', type: 'invalid_request_error' } },
        { status: 400 }
      );
    }

    const result = await processGatewayRequest(body, authHeader, 'completions');

    if (!result.success) {
      return NextResponse.json(
        { error: { message: result.error, type: 'gateway_error' } },
        { status: result.statusCode || 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Completions error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'server_error' } },
      { status: 500 }
    );
  }
}
