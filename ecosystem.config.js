module.exports = {
  apps: [
    {
      name: 'wtet-server',
      script: './dist/main.js',
      env: {
        NODE_ENV: 'development',
        SUPABASE_KEY:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhemZhanNsaG52emhwYWlhbmhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzAxNTc4NSwiZXhwIjoyMDM4NTkxNzg1fQ.d49EiTyPH5pnBzQDtuklxj2g05IKN9K7IPyD-OqdbDI',
        SUPABASE_URL: 'https://sazfajslhnvzhpaianhl.supabase.co',
      },
    },
  ],
};
