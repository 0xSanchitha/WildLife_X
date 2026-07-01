import React from 'react'


const palette = {
  ocean: {
    dark:  { solid: '#355872', mid: '#7AAACE', text: '#F7F8F0' },
    light: { solid: '#7AAACE', mid: '#355872', text: '#1A1A1A' },
  },
  forest: {
    dark:  { solid: '#346739', mid: '#79AE6F', text: '#F2EDC2' },
    light: { solid: '#F2EDC2', mid: '#346739', text: '#1A1A1A' },
  },
}

const sizes = {
  sm: { padding: '6px 18px',  fontSize: '12px', gap: '6px'  },
  md: { padding: '12px 32px', fontSize: '14px', gap: '8px'  },
  lg: { padding: '14px 32px', fontSize: '16px', gap: '10px' },
}

const Button = ({
  variant  = 'primary',
  theme    = 'ocean',
  shade    = 'dark',
  size     = 'md',
  icon,
  iconEnd,
  disabled = false,
  onClick,
  children,
  className = '',
  style: extraStyle = {},
  ...rest
}) => {
  const colors = palette[theme][shade]
  const sz     = sizes[size]

  // Build inline styles per variant — 100% reliable, no purge issues
  const variantStyle = {
    primary: {
      backgroundColor: colors.solid,
      color:           colors.text,
      border:          `1.5px solid ${colors.solid}`,
    },
    outline: {
      backgroundColor: 'transparent',
      color:           colors.solid,
      border:          `1.5px solid ${colors.solid}`,
    },
    forestOutlineLight: {
      backgroundColor: 'transparent',
      color: palette.forest.light.solid,
      border: `1.5px solid ${palette.forest.light.solid}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color:           colors.solid,
      border:          '1.5px solid transparent',
    },
  }[variant]

  const baseStyle = {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            sz.gap,
    padding:        sz.padding,
    fontSize:       sz.fontSize,
    fontFamily:     "'Inter', sans-serif",
    fontWeight:     '500',
    borderRadius:   '9999px',
    cursor:         disabled ? 'not-allowed' : 'pointer',
    opacity:        disabled ? 0.4 : 1,
    transition:     'all 0.25s ease',
    pointerEvents:  disabled ? 'none' : 'auto',
    ...variantStyle,
    ...extraStyle,
  }

  // Hover handled via onMouseEnter / onMouseLeave (no Tailwind needed)
  const handleMouseEnter = (e) => {
    if (disabled) return
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = colors.mid
      e.currentTarget.style.borderColor     = colors.mid
      e.currentTarget.style.transform       = 'scale(1.04)'
    } else if (variant === 'outline') {
      e.currentTarget.style.backgroundColor = colors.solid
      e.currentTarget.style.color           = colors.text
      e.currentTarget.style.transform       = 'scale(1.04)'
    }
    else if (variant === 'forestOutlineLight') {
      e.currentTarget.style.backgroundColor = palette.forest.dark.solid
      e.currentTarget.style.color = palette.ocean.dark.text // or '#F2EDC2'
      e.currentTarget.style.borderColor = palette.forest.dark.solid
      e.currentTarget.style.transform = 'scale(1.04)'
    } else {
      e.currentTarget.style.backgroundColor = colors.solid + '18' // 10% opacity
      e.currentTarget.style.transform       = 'scale(1.04)'
    }
  }

  const handleMouseLeave = (e) => {
    if (disabled) return
    Object.assign(e.currentTarget.style, variantStyle)
    e.currentTarget.style.transform = 'scale(1)'
  }

  const handleMouseDown = (e) => {
    if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'
  }

  const handleMouseUp = (e) => {
    if (!disabled) e.currentTarget.style.transform = 'scale(1.04)'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={className}
      {...rest}
    >
      {icon    && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
      <span>{children}</span>
      {iconEnd && <span style={{ display: 'flex', flexShrink: 0 }}>{iconEnd}</span>}
    </button>
  )
}

export default Button