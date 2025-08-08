module.exports = {
  apps: [
    {
      name: 'seguimiento-saem',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/seguimiento',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/ubuntu/seguimiento/logs/pm2-error.log',
      out_file: '/home/ubuntu/seguimiento/logs/pm2-out.log',
      log_file: '/home/ubuntu/seguimiento/logs/pm2-combined.log',
      time: true
    }
  ]
};
