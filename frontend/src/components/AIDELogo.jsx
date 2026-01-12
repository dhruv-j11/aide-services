import React from 'react'

const AIDELogo = ({ size = 'large', className = '' }) => {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl', 
    large: 'text-6xl',
    xl: 'text-8xl'
  }

  return (
    <div className={`font-bold text-black ${sizeClasses[size]} ${className}`}>
      <span className="relative">
        A
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black transform -translate-y-1/2"></div>
      </span>
      IDE
    </div>
  )
}

export default AIDELogo
