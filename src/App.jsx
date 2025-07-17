import { useEffect, useRef } from 'react'
import './App.css'

function App() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const ratio = window.devicePixelRatio || 1

    let width = canvas.width = window.innerWidth * ratio
    let height = canvas.height = window.innerHeight * ratio
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    ctx.scale(ratio, ratio)

    const rand = Math.random

    ctx.fillStyle = "rgba(0,0,0,1)"
    ctx.fillRect(0, 0, width, height)

    const heartPosition = rad => [
      Math.pow(Math.sin(rad), 3),
      -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))
    ]

    const scaleAndTranslate = (pos, sx, sy, dx, dy) => [
      dx + pos[0] * sx,
      dy + pos[1] * sy
    ]

    const pointsOrigin = []
    for (let i = 0; i < Math.PI * 2; i += 0.1) {
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0))
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0))
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0))
    }

    const heartPointsCount = pointsOrigin.length
    const targetPoints = []

    const pulse = (kx, ky) => {
      for (let i = 0; i < pointsOrigin.length; i++) {
        targetPoints[i] = [
          kx * pointsOrigin[i][0] + width / (2 * ratio),
          ky * pointsOrigin[i][1] + height / (2 * ratio)
        ]
      }
    }

    const traceCount = ratio > 1.5 ? 20 : 50
    const e = []
    for (let i = 0; i < heartPointsCount; i++) {
      const x = rand() * (width / ratio)
      const y = rand() * (height / ratio)
      e[i] = {
        vx: 0,
        vy: 0,
        R: 2,
        speed: rand() + 5,
        q: ~~(rand() * heartPointsCount),
        D: 2 * (i % 2) - 1,
        force: 0.2 * rand() + 0.7,
        f: `hsla(0,${~~(40 * rand() + 60)}%,${~~(60 * rand() + 20)}%,.5)`,
        trace: Array.from({ length: traceCount }, () => ({ x, y }))
      }
    }

    const config = {
      traceK: 0.4,
      timeDelta: 0.01
    }

    let time = 0

    const loop = () => {
      const n = -Math.cos(time)
      pulse((1 + n) * 0.5, (1 + n) * 0.5)
      time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8 ? 0.2 : 1)) * config.timeDelta
      ctx.fillStyle = "rgba(0,0,0,.1)"
      ctx.fillRect(0, 0, width, height)

      for (let i = e.length; i--;) {
        const u = e[i]
        const q = targetPoints[u.q]
        const dx = u.trace[0].x - q[0]
        const dy = u.trace[0].y - q[1]
        const length = Math.sqrt(dx * dx + dy * dy)

        if (length < 10) {
          if (rand() > 0.95) {
            u.q = ~~(rand() * heartPointsCount)
          } else {
            if (rand() > 0.99) u.D *= -1
            u.q = (u.q + u.D + heartPointsCount) % heartPointsCount
          }
        }

        u.vx += (-dx / length) * u.speed
        u.vy += (-dy / length) * u.speed
        u.trace[0].x += u.vx
        u.trace[0].y += u.vy
        u.vx *= u.force
        u.vy *= u.force

        for (let k = 0; k < u.trace.length - 1; k++) {
          const T = u.trace[k]
          const N = u.trace[k + 1]
          N.x -= config.traceK * (N.x - T.x)
          N.y -= config.traceK * (N.y - T.y)
        }

        ctx.fillStyle = u.f
        for (let k = 0; k < u.trace.length; k++) {
          ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1)
        }
      }

      requestAnimationFrame(loop)
    }

    loop()

    const onResize = () => {
      width = canvas.width = window.innerWidth * ratio
      height = canvas.height = window.innerHeight * ratio
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
      ctx.scale(ratio, ratio)
      ctx.fillStyle = "rgba(0,0,0,1)"
      ctx.fillRect(0, 0, width, height)
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <canvas ref={canvasRef} style={{ display: 'block' }} />
  )
}

export default App
