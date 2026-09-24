import { describe, expect, it } from 'vitest';
import { validateClientAccount, validatePayment, validateProject, validateStage, validateUpdate } from '../src/lib/validation';

const validProject = {
  client_id: 'client-1', name: 'Portal', slug: 'client-portal', description: '',
  status: 'active', progress_percentage: 50, start_date: '2026-01-01', estimated_end_date: '2026-02-01',
};

describe('project validation', () => {
  it('accepts a valid project', () => expect(validateProject(validProject)).toBe(''));
  it('rejects invalid slugs', () => expect(validateProject({ ...validProject, slug: 'Bad Slug' })).toMatch(/lowercase/));
  it('rejects progress outside the database range', () => expect(validateProject({ ...validProject, progress_percentage: 101 })).toMatch(/between 0 and 100/));
  it('rejects an end date before the start date', () => expect(validateProject({ ...validProject, estimated_end_date: '2025-12-31' })).toMatch(/cannot be before/));
});

describe('project resource validation', () => {
  it('requires a positive stage order', () => expect(validateStage({ name: 'Build', position: 0 })).toMatch(/positive/));
  it('requires update content', () => expect(validateUpdate({ message: '   ' })).toMatch(/message/));
  it('rejects negative payment amounts', () => expect(validatePayment({ description: 'Deposit', amount: -1 })).toMatch(/zero or greater/));
});

describe('client account validation', () => {
  const validClient = { name: 'Ana Torres', email: 'ana@example.com', password: 'StrongPass!42' };

  it('accepts complete client credentials', () => expect(validateClientAccount(validClient)).toBe(''));
  it('rejects malformed email addresses', () => expect(validateClientAccount({ ...validClient, email: 'not-an-email' })).toMatch(/valid email/));
  it('requires a strong 12-character password', () => expect(validateClientAccount({ ...validClient, password: 'password' })).toMatch(/12/));
});
