document.addEventListener('DOMContentLoaded', () => {
  const authPage = document.querySelector('.auth-page')
  const layer = document.querySelector('.particle-layer')
  if (!authPage || !layer) return

  const particleCount = 36
  const colors = [
    'rgba(56, 189, 248, 0.95)',
    'rgba(139, 92, 246, 0.9)',
    'rgba(248, 113, 113, 0.9)',
    'rgba(59, 130, 246, 0.9)'
  ]

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('span')
    particle.className = 'particle'

    const size = Math.random() * 16 + 6
    const left = Math.random() * 100
    const top = Math.random() * 100 + 20
    const duration = Math.random() * 12 + 10
    const delay = Math.random() * -12
    const moveX = (Math.random() - 0.5) * 80
    const opacity = Math.random() * 0.4 + 0.35
    const color = colors[Math.floor(Math.random() * colors.length)]

    particle.style.width = `${size}px`
    particle.style.height = `${size}px`
    particle.style.left = `${left}%`
    particle.style.top = `${top}%`
    particle.style.background = `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0.1) 55%, transparent 100%)`
    particle.style.opacity = opacity
    particle.style.animationDuration = `${duration}s`
    particle.style.animationDelay = `${delay}s`
    particle.style.setProperty('--move-x', `${moveX}px`)

    layer.appendChild(particle)
  }
})
