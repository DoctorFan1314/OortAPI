import { NextRequest, NextResponse } from 'next/server';
import { validateUserFromCookie } from '@/lib/api-gateway';
import { logAdminAction } from '@/lib/billing-engine';
import db from '@/lib/db';
import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get database file path
    const dbPath = join(process.cwd(), 'data', 'oortapi.db');

    // Use SQLite VACUUM INTO for a consistent backup
    const backupPath = join(process.cwd(), 'data', `backup-${Date.now()}.db`);

    try {
      db.exec(`VACUUM INTO '${backupPath}'`);
      const backupData = readFileSync(backupPath);

      // Clean up the temp file
      unlinkSync(backupPath);

      logAdminAction(auth.user.id, 'download_backup', 'backup', undefined, `size=${backupData.length}`, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());

      return new Response(backupData, {
        headers: {
          'Content-Type': 'application/x-sqlite3',
          'Content-Disposition': `attachment; filename="oortapi-backup-${new Date().toISOString().slice(0, 10)}.db"`,
        },
      });
    } catch (dbError) {
      // Fallback: return raw db file
      const dbData = readFileSync(dbPath);

      logAdminAction(auth.user.id, 'download_backup', 'backup', undefined, `fallback, size=${dbData.length}`, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());

      return new Response(dbData, {
        headers: {
          'Content-Type': 'application/x-sqlite3',
          'Content-Disposition': `attachment; filename="oortapi-backup-${new Date().toISOString().slice(0, 10)}.db"`,
        },
      });
    }
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
  }
}
