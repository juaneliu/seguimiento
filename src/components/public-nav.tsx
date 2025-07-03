"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Notebook, FileText, Building2 } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const publicItems: NavItem[] = [
  {
    title: "Inicio",
    href: "/publico",
    icon: LayoutDashboard,
  },
  {
    title: "Diagnósticos",
    href: "/publico/diagnosticos",
    icon: Notebook,
  },
  {
    title: "Directorio OIC",
    href: "/publico/directorio",
    icon: FileText,
  },
  {
    title: "Entes Públicos",
    href: "/publico/entes",
    icon: Building2,
  },
]

export function PublicNav() {
  const pathname = usePathname()

  return (
    <div className="border-r border-slate-300 bg-white/95 backdrop-blur-sm shadow-lg lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/publico" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm leading-tight">Sistema de Seguimiento</h1>
              <p className="text-xs text-slate-600">SAEM - Consulta Pública</p>
            </div>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {publicItems.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.href}
                      className={cn(
                        pathname === item.href
                          ? "bg-slate-100 text-slate-900 shadow-sm"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-all duration-200"
                      )}
                    >
                      <item.icon
                        className={cn(
                          pathname === item.href ? "text-slate-600" : "text-slate-400 group-hover:text-slate-600",
                          "h-5 w-5 shrink-0"
                        )}
                      />
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
        <div className="border-t border-slate-200 pt-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-slate-900 mb-1">Acceso Público</h3>
            <p className="text-xs text-slate-600">Esta es la versión de consulta pública. Para acceso administrativo, ingrese al dashboard principal.</p>
            <Link 
              href="/login" 
              className="inline-block mt-2 text-xs text-slate-700 hover:text-slate-900 underline"
            >
              Acceso Administrativo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
