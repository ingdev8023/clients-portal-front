import { beforeEach, describe, expect, it, vi } from 'vitest';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({
  supabase: { functions: { invoke } },
}));

const { createClientAccount } = await import('../src/models/adminDashboardModel');

describe('admin dashboard model', () => {
  beforeEach(() => invoke.mockReset());

  it('normalizes client data before invoking the protected function', async () => {
    invoke.mockResolvedValue({ data: { client: { id: 'client-2', name: 'Ana Torres' } }, error: null });

    await expect(createClientAccount({
      name: '  Ana Torres  ', email: ' ANA@EXAMPLE.COM ', password: 'StrongPass!42',
    })).resolves.toEqual({ id: 'client-2', name: 'Ana Torres' });

    expect(invoke).toHaveBeenCalledWith('create-client', {
      body: { name: 'Ana Torres', email: 'ana@example.com', password: 'StrongPass!42' },
    });
  });

  it('keeps function implementation details out of the thrown error', async () => {
    invoke.mockResolvedValue({ data: { code: 'EMAIL_EXISTS' }, error: new Error('Internal service detail') });
    await expect(createClientAccount({ name: 'Ana', email: 'ana@example.com', password: 'StrongPass!42' }))
      .rejects.toMatchObject({ code: 'EMAIL_EXISTS', message: 'Client creation failed.' });
  });
});
