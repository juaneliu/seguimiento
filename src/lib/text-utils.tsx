import React from 'react'
import { ExternalLink, Link } from 'lucide-react'

/**
 * Convierte texto con URLs en elementos React con links clicables
 * Detecta URLs que empiecen con http://, https://, www. o que tengan formato de email
 */
export function renderTextWithLinks(text: string | null | undefined): React.ReactNode {
  if (!text) return null

  // Regex para detectar URLs más común y emails
  const urlRegex = /((?:https?:\/\/|www\.)[^\s<>"{}|\\^`[\]]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
  
  const parts = text.split(urlRegex)
  
  return parts.map((part, index) => {
    // Si es una URL
    if (part.match(urlRegex)) {
      let href = part
      
      // Si es email, agregar mailto:
      if (part.includes('@') && !part.startsWith('http')) {
        href = `mailto:${part}`
      }
      // Si es www sin protocolo, agregar https://
      else if (part.startsWith('www.')) {
        href = `https://${part}`
      }
      
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
        >
          <span className="break-all">{part}</span>
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      )
    }
    
    // Si es texto normal
    return <span key={index}>{part}</span>
  })
}

/**
 * Trunca texto de manera inteligente, evitando cortar links por la mitad
 * Si un link se va a truncar, lo omite completamente del texto visible
 */
function smartTruncateWithLinks(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  const urlRegex = /((?:https?:\/\/|www\.)[^\s<>"{}|\\^`[\]]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
  
  // Encontrar todas las URLs y sus posiciones
  const urls = []
  let match
  
  while ((match = urlRegex.exec(text)) !== null) {
    urls.push({
      url: match[0],
      start: match.index,
      end: match.index + match[0].length
    })
  }
  
  // Si no hay URLs, truncar normalmente
  if (urls.length === 0) {
    return text.substring(0, maxLength) + '...'
  }
  
  // Verificar si alguna URL estaría truncada
  let safeTruncateLength = maxLength
  
  for (const urlInfo of urls) {
    // Si la URL empieza dentro del rango de truncado pero no termina
    if (urlInfo.start < maxLength && urlInfo.end > maxLength) {
      // Truncar antes de esta URL para no cortarla
      safeTruncateLength = urlInfo.start
      break
    }
  }
  
  // Si necesitamos truncar antes para evitar cortar una URL
  if (safeTruncateLength < maxLength && safeTruncateLength > 0) {
    // Buscar el último espacio antes de la URL para no cortar palabras
    const textBeforeUrl = text.substring(0, safeTruncateLength)
    const lastSpaceIndex = textBeforeUrl.lastIndexOf(' ')
    
    if (lastSpaceIndex > 0 && (safeTruncateLength - lastSpaceIndex) < 30) {
      safeTruncateLength = lastSpaceIndex
    }
    
    return text.substring(0, safeTruncateLength).trim() + '...'
  }
  
  // Si no hay conflictos, truncar normalmente
  return text.substring(0, maxLength) + '...'
}

/**
 * Componente para renderizar texto con links
 */
export function TextWithLinks({ 
  text, 
  className = "",
  maxLength
}: { 
  text: string | null | undefined
  className?: string
  maxLength?: number 
}) {
  if (!text) return null
  
  // Si hay límite de longitud, usar truncado inteligente
  const displayText = maxLength && text.length > maxLength 
    ? smartTruncateWithLinks(text, maxLength)
    : text
  
  return (
    <span className={className}>
      {renderTextWithLinks(displayText)}
    </span>
  )
}

/**
 * Componente especializado para tablas que muestra un indicador cuando hay links ocultos
 */
export function TextWithLinksForTable({ 
  text, 
  className = "",
  maxLength = 100
}: { 
  text: string | null | undefined
  className?: string
  maxLength?: number 
}) {
  if (!text) return <span className={className}>-</span>
  
  const urlRegex = /((?:https?:\/\/|www\.)[^\s<>"{}|\\^`[\]]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
  const hasLinks = urlRegex.test(text)
  
  // Usar truncado inteligente
  const displayText = text.length > maxLength 
    ? smartTruncateWithLinks(text, maxLength)
    : text
  
  // Verificar si se ocultaron links por el truncado
  const originalLinksCount = (text.match(urlRegex) || []).length
  const truncatedLinksCount = (displayText.match(urlRegex) || []).length
  const hasHiddenLinks = originalLinksCount > truncatedLinksCount
  
  return (
    <span className={className}>
      {renderTextWithLinks(displayText)}
      {hasHiddenLinks && (
        <span className="ml-1 inline-flex items-center text-blue-500 dark:text-blue-400">
          <Link className="h-3 w-3" />
          <span className="text-xs ml-0.5">+{originalLinksCount - truncatedLinksCount}</span>
        </span>
      )}
    </span>
  )
}
