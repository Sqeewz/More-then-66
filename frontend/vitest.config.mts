import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname || __dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    env: {
      BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_mock_token_for_tests_12345',
      BLOB_STORE_ID: 'store_mock_id',
    },
  },
});
