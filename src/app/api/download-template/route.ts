import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'transactions-template.csv');
    const data = await fs.readFile(filePath);

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="transactions-template.csv"',
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Error downloading file', { status: 500 });
  }
}
