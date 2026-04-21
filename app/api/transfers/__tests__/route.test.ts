import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';

const mockTransfers = [
  { id: '1', player: 'Active Player', from_team: 'A', to_team: 'B', window: 'summer_25', deleted: false },
  { id: '2', player: 'Deleted Player', from_team: 'C', to_team: 'D', window: 'summer_25', deleted: true }
];

let currentTransfers = [...mockTransfers];

vi.mock('../../../lib/db', () => {
  return {
    isSupabaseConfigured: () => true,
    getSupabaseAdmin: () => ({
      from: () => ({
        select: vi.fn().mockImplementation(async () => ({ data: currentTransfers, error: null })),
        insert: vi.fn().mockImplementation(async (row: any) => {
          currentTransfers = [...currentTransfers, row];
          return { error: null };
        }),
        update: vi.fn().mockImplementation((patch: any) => ({
          eq: vi.fn().mockImplementation(async (field: string, value: any) => {
            currentTransfers = currentTransfers.map((t: any) => (t?.[field] === value ? { ...t, ...patch } : t));
            return { error: null };
          })
        })),
        delete: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(async (field: string, value: any) => {
            currentTransfers = currentTransfers.filter((t: any) => t?.[field] !== value);
            return { error: null };
          })
        }))
      })
    })
  };
});

describe('Transfers API', () => {
    beforeEach(() => {
        currentTransfers = [...mockTransfers];
    });

    it('GET /api/transfers returns only non-deleted items by default', async () => {
        const req = new Request('http://localhost/api/transfers');
        const res = await GET(req);
        const data = await res.json();

        expect(data.all).toBeDefined();
        const deletedItem = data.all.find((t: any) => t.id === '2');
        const activeItem = data.all.find((t: any) => t.id === '1');

        expect(deletedItem).toBeUndefined();
        expect(activeItem).toBeDefined();
    });

    it('GET /api/transfers?includeDeleted=true returns deleted items', async () => {
        const req = new Request('http://localhost/api/transfers?includeDeleted=true');
        const res = await GET(req);
        const data = await res.json();

        const deletedItem = data.all.find((t: any) => t.id === '2');
        expect(deletedItem).toBeDefined();
    });

    it('POST (delete) marks item as deleted', async () => {
        const req = new Request('http://localhost/api/transfers', {
            method: 'POST',
            body: JSON.stringify({
                action: 'delete',
                transfer: { id: '1' }
            })
        });
        
        await POST(req);
        
        // Check if updated
        const updatedReq = new Request('http://localhost/api/transfers?includeDeleted=true');
        const res = await GET(updatedReq);
        const data = await res.json();
        const item = data.all.find((t: any) => t.id === '1');
        
        expect(item.deleted).toBe(true);
    });

    it('POST (restore) marks item as not deleted', async () => {
        const req = new Request('http://localhost/api/transfers', {
            method: 'POST',
            body: JSON.stringify({
                action: 'restore',
                transfer: { id: '2' }
            })
        });
        
        await POST(req);
        
        const updatedReq = new Request('http://localhost/api/transfers');
        const res = await GET(updatedReq);
        const data = await res.json();
        const item = data.all.find((t: any) => t.id === '2');
        
        expect(item).toBeDefined();
        expect(item.deleted).toBe(false);
    });

    it('POST (hard_delete) removes item permanently', async () => {
        const req = new Request('http://localhost/api/transfers', {
            method: 'POST',
            body: JSON.stringify({
                action: 'hard_delete',
                transfer: { id: '2' }
            })
        });
        
        await POST(req);
        
        const updatedReq = new Request('http://localhost/api/transfers?includeDeleted=true');
        const res = await GET(updatedReq);
        const data = await res.json();
        const item = data.all.find((t: any) => t.id === '2');
        
        expect(item).toBeUndefined();
    });
});
