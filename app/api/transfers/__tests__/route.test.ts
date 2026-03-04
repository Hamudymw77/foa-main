import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '../route';

// Mock fs
const mockTransfers = [
    { id: '1', player: 'Active Player', from: 'A', to: 'B', window: 'summer_25', deleted: false },
    { id: '2', player: 'Deleted Player', from: 'C', to: 'D', window: 'summer_25', deleted: true },
];

let currentTransfers = [...mockTransfers];

vi.mock('fs', () => {
    return {
        promises: {
            readFile: vi.fn().mockImplementation(async () => JSON.stringify(currentTransfers)),
            writeFile: vi.fn().mockImplementation(async (path, data) => {
                currentTransfers = JSON.parse(data as string);
            }),
        },
        default: {
             promises: {
                readFile: vi.fn().mockImplementation(async () => JSON.stringify(currentTransfers)),
                writeFile: vi.fn().mockImplementation(async (path, data) => {
                    currentTransfers = JSON.parse(data as string);
                }),
            }
        }
    };
});

// Mock process.cwd
vi.spyOn(process, 'cwd').mockReturnValue('/tmp');

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
