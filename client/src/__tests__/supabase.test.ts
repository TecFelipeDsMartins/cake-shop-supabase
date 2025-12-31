import { describe, it, expect } from 'vitest';

describe('Supabase Configuration', () => {
  it('should have valid Supabase environment variables', () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseAnonKey).toBeDefined();
    
    // Validate URL format
    expect(supabaseUrl).toMatch(/^https:\/\/.+\.supabase\.co$/);
    
    // Validate key format (JWT tokens are typically long strings)
    expect(supabaseAnonKey.length).toBeGreaterThan(20);
  });

  it('should be able to create Supabase client', async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Test basic client creation
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });

    // Should get a response (even if 404, it means the server is reachable)
    expect(response.status).toBeLessThan(500);
  });
});
