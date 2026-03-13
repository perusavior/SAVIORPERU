'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, themes } = useTheme()

  // useEffect solo se ejecuta en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // No renderizar hasta que esté montado (evita hydration mismatch)
  if (!mounted) {
    return (
      <Button variant='ghost' size='icon' className='w-10 h-10'>
        <Sun className='h-[1.2rem] w-[1.2rem]' />
      </Button>
    )
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={() => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }}
      className='w-10 h-10'
    >
      {theme === 'dark' ? (
        <Sun className='h-[1.2rem] w-[1.2rem] text-yellow-500' />
      ) : (
        <Moon className='h-[1.2rem] w-[1.2rem] text-slate-700' />
      )}
      <span className='sr-only'>Toggle theme</span>
    </Button>
  )
}
