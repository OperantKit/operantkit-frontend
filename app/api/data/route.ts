import { NextResponse } from 'next/server';
import { mockExperimentSessionData } from '../../../types/data';

export async function GET() {
  return NextResponse.json(mockExperimentSessionData);
}
