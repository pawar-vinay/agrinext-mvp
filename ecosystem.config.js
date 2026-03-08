module.exports = {
  apps: [{
    name: 'agrinext-api',
    script: 'src/server.ts',
    interpreter: 'tsx',
    env: {
      NODE_ENV: 'production'
    },
    // Load .env file
    env_file: '.env',
    // Auto restart on crash
    autorestart: true,
    // Max memory restart
    max_memory_restart: '400M',
    // Error log file
    error_file: '/home/ssm-user/.pm2/logs/agrinext-api-error.log',
    // Output log file
    out_file: '/home/ssm-user/.pm2/logs/agrinext-api-out.log',
    // Merge logs
    merge_logs: true,
    // Log date format
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
