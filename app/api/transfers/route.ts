import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'app', 'transfers.json');

// Helper to read/write transfers
async function getCustomTransfers() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

async function saveCustomTransfers(transfers: any[]) {
    await fs.writeFile(DB_PATH, JSON.stringify(transfers, null, 2));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const transfers = await getCustomTransfers();
    
    // Filter out deleted unless requested
    const visibleTransfers = includeDeleted 
        ? transfers 
        : transfers.filter((t: any) => !t.deleted);

    // Sort logic handled in frontend or pre-sorted?
    // Let's split into summer and winter for the frontend
    const summer = visibleTransfers.filter((t: any) => t.window === 'summer_25');
    const winter = visibleTransfers.filter((t: any) => t.window === 'winter_26');

    // If fetching deleted specifically (e.g. for trash view), we might want a flat list or separated
    // For now, returning standard structure but filtered is consistent.
    // If includeDeleted is true, we return ALL. The frontend can filter by t.deleted if it wants to show ONLY deleted.

    return NextResponse.json({
        summer,
        winter,
        all: visibleTransfers // Returning flat list too might be helpful for admin
    });

  } catch (error) {
    console.error('Transfers API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, transfer } = body;
        
        let customTransfers = await getCustomTransfers();

        if (action === 'add') {
            customTransfers.unshift({
                ...transfer,
                id: Date.now().toString(),
                deleted: false
            });
            await saveCustomTransfers(customTransfers);
            return NextResponse.json({ success: true });
        }
        
        if (action === 'delete') {
            // Soft delete
            customTransfers = customTransfers.map((t: any) => {
                if (t.id === transfer.id || (t.player === transfer.name && t.from === transfer.from && t.to === transfer.to)) {
                    return { ...t, deleted: true };
                }
                return t;
            });
            await saveCustomTransfers(customTransfers);
            return NextResponse.json({ success: true });
        }

        if (action === 'restore') {
            // Restore from trash
            customTransfers = customTransfers.map((t: any) => {
                if (t.id === transfer.id) {
                    return { ...t, deleted: false };
                }
                return t;
            });
            await saveCustomTransfers(customTransfers);
            return NextResponse.json({ success: true });
        }

        if (action === 'hard_delete') {
            // Permanent delete (only for trash)
            customTransfers = customTransfers.filter((t: any) => t.id !== transfer.id);
            await saveCustomTransfers(customTransfers);
            return NextResponse.json({ success: true });
        }

        if (action === 'update') {
            customTransfers = customTransfers.map((t: any) => {
                if (t.id !== transfer.id) return t;
                return {
                    ...t,
                    photo: transfer.photo ?? t.photo ?? null,
                    fromLogo: transfer.fromLogo ?? t.fromLogo ?? null,
                    toLogo: transfer.toLogo ?? t.toLogo ?? null
                };
            });
            await saveCustomTransfers(customTransfers);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to update transfers' }, { status: 500 });
    }
}
