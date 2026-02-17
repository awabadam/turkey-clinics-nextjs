import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LuxuryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string
}

export function LuxuryImage({ src, alt, className, wrapperClassName, ...props }: LuxuryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className={cn("relative overflow-hidden bg-muted", wrapperClassName)}>
      {/* Placeholder Blur */}
      <motion.div
        className="absolute inset-0 bg-muted z-10"
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoaded ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      />
      
      <motion.img
        src={src}
        alt={alt}
        className={cn("w-full h-full object-cover", className)}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ 
          scale: isLoaded ? 1 : 1.1, 
          opacity: isLoaded ? 1 : 0 
        }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        onLoad={() => setIsLoaded(true)}
        {...props as any}
      />
    </div>
  )
}
