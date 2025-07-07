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
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/ubuntu/seguimiento/logs/pm2-error.log',
      out_file: '/home/ubuntu/seguimiento/logs/pm2-out.log',
      log_file: '/home/ubuntu/seguimiento/logs/pm2-combined.log',
      time: true,
      // Reintentos automáticos
      min_uptime: '10s',
      max_restarts: 10,
      // Configuración para evitar caídas
      kill_timeout: 5000,
      listen_timeout: 8000,
      restart_delay: 4000
    }
  ]
};
