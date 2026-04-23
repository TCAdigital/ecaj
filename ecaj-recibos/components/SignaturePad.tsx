'use client'

import { useRef, useEffect } from 'react'

interface SignaturePadProps {
  onSave: (signatureData: string) => void
  onCancel: () => void
}

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set white background
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#003366'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      isDrawingRef.current = true
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      ctx?.beginPath()
      ctx?.moveTo(x, y)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawingRef.current) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      ctx?.lineTo(x, y)
      ctx?.stroke()
    }

    const handleMouseUp = () => {
      isDrawingRef.current = false
      ctx?.closePath()
    }

    // Touch events (para celular)
    const handleTouchStart = (e: TouchEvent) => {
      isDrawingRef.current = true
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      ctx?.beginPath()
      ctx?.moveTo(x, y)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawingRef.current) return
      e.preventDefault()

      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      ctx?.lineTo(x, y)
      ctx?.stroke()
    }

    const handleTouchEnd = () => {
      isDrawingRef.current = false
      ctx?.closePath()
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)

    canvas.addEventListener('touchstart', handleTouchStart)
    canvas.addEventListener('touchmove', handleTouchMove)
    canvas.addEventListener('touchend', handleTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signatureData = canvas.toDataURL('image/png')
    onSave(signatureData)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-secondary-600">
          Digital Signature
        </p>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider"
        >
          Limpar Quadro
        </button>
      </div>

      <div className="border-2 border-secondary-200 rounded-2xl overflow-hidden bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-48 md:h-64 cursor-crosshair touch-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-secondary-200 text-secondary-700 hover:bg-secondary-50 rounded-xl font-semibold transition-all"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-md shadow-primary-600/20 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Confirmar Assinatura
        </button>
      </div>
    </div>
  )
}
