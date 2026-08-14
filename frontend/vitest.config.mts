import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname || process.cwd(), './src'),
    },
  },
  test: {
    environment: 'node',
    env: {
      SUPABASE_URL: 'https://mock.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'mock_service_role_key_for_vitest_tests_12345',
      BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_mock_token_for_tests_12345',
      BLOB_STORE_ID: 'store_mock_id',
    },
  },
});
