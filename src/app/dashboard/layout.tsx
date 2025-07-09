import { TopNav } from "@/components/top-nav"
import { MainNav } from "@/components/main-nav"
import { ProtectedRoute } from "@/components/protected-route"
import Image from "next/image"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'OPERATIVO', 'SEGUIMIENTO', 'INVITADO']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image
            src="/img/cuernavaca_atardecer.jpg"
            alt="Cuernavaca Atardecer"
            fill
            className="object-cover opacity-15 dark:opacity-10"
            priority
          />
        </div>
        
        {/* Contenido principal con posición relativa para estar por encima de la imagen de fondo */}
        <div className="relative z-10 min-h-screen">
          <TopNav />
          <MainNav />
          <main className="lg:ml-64 pt-12 sm:pt-14 md:pt-16">
            <div className="min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)] p-3 sm:p-4 md:p-6 lg:p-8 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
