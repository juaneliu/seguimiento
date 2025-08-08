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
      // Configuración mejorada para evitar 502
      min_uptime: '30s',          // Tiempo mínimo antes de considerar que está funcionando
      max_restarts: 15,           // Más intentos de reinicio
      kill_timeout: 8000,         // Más tiempo para terminar procesos
      listen_timeout: 15000,      // Más tiempo para que la app escuche
      restart_delay: 5000,        // Delay entre reinicios
      // Health check
      health_check_grace_period: 30000,  // 30 segundos de gracia después del inicio
      // Configuración adicional
      max_restarts_in_min: 5,     // Máximo 5 reinicios por minuto
      restart_delay_max: 20000,   // Delay máximo entre reinicios
      // Configuración de memoria y CPU
      node_args: ['--max-old-space-size=1024']
    }
  ]
};
