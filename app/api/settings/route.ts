// operantkit/apps/operantkit-frontend/app/api/settings/route.ts
import { NextResponse } from 'next/server';
import { defaultExperimentSettings, ExperimentSettings } from '../../../types/experiment';

// Mock in-memory store for settings (for demonstration purposes)
let currentSettings: ExperimentSettings = defaultExperimentSettings;

export async function GET() {
  return NextResponse.json(currentSettings);
}

export async function POST(request: Request) {
  try {
    const newSettings: ExperimentSettings = await request.json();
    console.log('Received settings:', newSettings);
    // In a real application, you would save newSettings to a database
    currentSettings = newSettings; // Update mock store
    return NextResponse.json({ message: 'Settings saved successfully', data: currentSettings }, { status: 200 });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ message: 'Error saving settings' }, { status: 500 });
  }
}
