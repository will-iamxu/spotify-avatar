import { NextResponse } from 'next/server';
import { getDynamicPrismaClient } from '@/lib/db-dynamic';

export async function GET() {
  try {
    // Test database connection
    const prisma = await getDynamicPrismaClient();
    
    // Try a simple query
    const userCount = await prisma.user.count();
    
    return NextResponse.json({ 
      status: 'success', 
      userCount,
      message: 'Database connection successful' 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database connection failed' 
    }, { status: 500 });
  }
}