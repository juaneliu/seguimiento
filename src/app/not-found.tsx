'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Importar fuente Abel */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Abel&display=swap" 
        rel="preload" 
        as="style" 
      />
      <link 
        href="https://fonts.googleapis.com/css2?family=Abel&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex flex-col">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image
            src="/img/cuernavaca_atardecer.jpg"
            alt="Cuernavaca Atardecer"
            fill
            className="object-cover opacity-25 dark:opacity-15"
            priority
          />
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-md">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl sm:rounded-3xl">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <div className="text-6xl sm:text-7xl font-bold text-slate-300 dark:text-slate-600 mb-4">
                    404
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    La página solicitada no está disponible
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border-t border-slate-200/30 dark:border-slate-700/30 p-4">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              © 2025 SAEM - Sistema de Administración Estatal de Morelos
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
