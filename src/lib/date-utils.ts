/**
 * Utilidades para manejo de fechas sin problemas de zona horaria
 */

/**
 * Formatea una fecha para input de tipo date (YYYY-MM-DD)
 * Maneja fechas sin problemas de zona horaria
 */
export function formatDateForInput(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return ''
  
  // Si viene como string, parsearlo como fecha local
  if (typeof dateValue === 'string') {
    // Si ya viene en formato YYYY-MM-DD, devolverlo directamente
    if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue
    }
    
    // Si viene como ISO string (YYYY-MM-DDTHH:mm:ss.sssZ), extraer solo la fecha
    if (dateValue.includes('T')) {
      return dateValue.split('T')[0]
    }
  }
  
  // Para objetos Date, usar UTC para evitar problemas de zona horaria
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return ''
  
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formatea una fecha para mostrar en formato español (DD MMM YYYY)
 * Maneja fechas sin problemas de zona horaria
 */
export function formatFechaEspanol(fecha: string | Date | null | undefined): string {
  if (!fecha) return ''
  
  const date = new Date(fecha)
  // Verificar si es una fecha válida
  if (isNaN(date.getTime())) return 'Fecha inválida'
  
  // Usar UTC para evitar problemas de zona horaria
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  
  const monthNames = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ]
  
  return `${day} ${monthNames[month]} ${year}`
}

/**
 * Formatea una fecha para toLocaleDateString pero usando UTC
 * Para compatibilidad con exportaciones que requieren el formato nativo
 */
export function formatFechaLocalUTC(fecha: string | Date | null | undefined, locale: string = 'es-MX'): string {
  if (!fecha) return ''
  
  const date = new Date(fecha)
  if (isNaN(date.getTime())) return ''
  
  // Crear una nueva fecha usando los componentes UTC como si fueran locales
  const utcDate = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(), 
    date.getUTCDate()
  )
  
  return utcDate.toLocaleDateString(locale)
}

/**
 * Calcula días restantes entre hoy y una fecha, sin problemas de zona horaria
 */
export function calcularDiasRestantes(fechaCompromiso: string | Date | null | undefined) {
  if (!fechaCompromiso) return { texto: 'Sin fecha', clase: "text-gray-500" }
  
  const hoy = new Date()
  // Usar UTC para crear fechas normalizadas
  const hoyUtc = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()))
  
  const compromiso = new Date(fechaCompromiso)
  if (isNaN(compromiso.getTime())) return { texto: 'Fecha inválida', clase: "text-red-500" }
  
  const compromisoUtc = new Date(Date.UTC(compromiso.getUTCFullYear(), compromiso.getUTCMonth(), compromiso.getUTCDate()))
  
  const diferencia = Math.ceil((compromisoUtc.getTime() - hoyUtc.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diferencia < 0) {
    return { texto: `${Math.abs(diferencia)} días de retraso`, clase: "text-red-600" }
  } else if (diferencia === 0) {
    return { texto: "Vence hoy", clase: "text-orange-600 font-medium" }
  } else if (diferencia <= 7) {
    return { texto: `${diferencia} días restantes`, clase: "text-yellow-600 font-medium" }
  } else {
    return { texto: `${diferencia} días restantes`, clase: "text-green-600" }
  }
}

/**
 * Crea una fecha local sin problemas de zona horaria a partir de un string YYYY-MM-DD
 * Para uso en APIs cuando se envían fechas
 */
export function createLocalDate(dateString: string): Date {
  if (!dateString) throw new Error('Fecha requerida')
  
  const [year, month, day] = dateString.split('-').map(Number)
  if (!year || !month || !day) throw new Error('Formato de fecha inválido')
  
  return new Date(year, month - 1, day) // month - 1 porque Date usa 0-indexing para meses
}
