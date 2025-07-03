"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { PublicNav } from "./public-nav"

export function PublicTopNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden" role="dialog">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="text-white hover:text-white"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <PublicNav />
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <PublicNav />
      </div>

      {/* Top navigation bar */}
      <div className="sticky top-0 z-40 flex h-14 md:h-16 shrink-0 items-center gap-x-4 border-b border-slate-300 bg-white/95 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 lg:ml-64">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center lg:hidden">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div className="lg:hidden">
                <h1 className="font-bold text-slate-900 text-sm leading-tight">Sistema de Seguimiento</h1>
                <p className="text-xs text-slate-600">SAEM - Consulta Pública</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600">Acceso Público</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
