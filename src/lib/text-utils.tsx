import React from 'react'
import { ExternalLink } from 'lucide-react'

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
  
  // Si hay límite de longitud, truncar el texto
  const displayText = maxLength && text.length > maxLength 
    ? `${text.substring(0, maxLength)}...` 
    : text
  
  return (
    <span className={className}>
      {renderTextWithLinks(displayText)}
    </span>
  )
}
