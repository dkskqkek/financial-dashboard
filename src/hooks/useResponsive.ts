import { useState, useEffect } from 'react'

interface BreakpointConfig {
  sm: number
  md: number
  lg: number
  xl: number
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
}

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export function useResponsive(breakpoints: BreakpointConfig = defaultBreakpoints) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xs')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setWindowSize({ width, height })

      if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl')
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg')
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md')
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm')
      } else {
        setCurrentBreakpoint('xs')
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoints])

  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm'
  const isTablet = currentBreakpoint === 'md'
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl'

  const getResponsiveValue = <T>(values: Partial<Record<Breakpoint, T>>, fallback: T): T => {
    return values[currentBreakpoint] ?? values.xs ?? fallback
  }

  return {
    windowSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    getResponsiveValue,
    breakpoints: {
      isXs: currentBreakpoint === 'xs',
      isSm: currentBreakpoint === 'sm',
      isMd: currentBreakpoint === 'md',
      isLg: currentBreakpoint === 'lg',
      isXl: currentBreakpoint === 'xl',
    },
  }
}

// 차트 크기 최적화를 위한 전용 훅
export function useChartDimensions() {
  const { isMobile, isTablet, currentBreakpoint } = useResponsive()

  const getChartHeight = (type: 'pie' | 'bar' | 'line' = 'bar') => {
    if (isMobile) {
      return type === 'pie' ? 200 : 180
    }
    if (isTablet) {
      return type === 'pie' ? 250 : 220
    }
    return type === 'pie' ? 300 : 280
  }

  const getChartMargin = () => {
    if (isMobile) {
      return { top: 10, right: 10, bottom: 20, left: 10 }
    }
    if (isTablet) {
      return { top: 15, right: 15, bottom: 30, left: 15 }
    }
    return { top: 20, right: 20, bottom: 40, left: 20 }
  }

  const getFontSize = (element: 'label' | 'legend' | 'tooltip' = 'label') => {
    const sizes = {
      xs: { label: 10, legend: 10, tooltip: 11 },
      sm: { label: 11, legend: 11, tooltip: 12 },
      md: { label: 12, legend: 12, tooltip: 13 },
      lg: { label: 13, legend: 13, tooltip: 14 },
      xl: { label: 14, legend: 14, tooltip: 15 },
    }

    return sizes[currentBreakpoint][element]
  }

  return {
    height: getChartHeight,
    margin: getChartMargin(),
    fontSize: getFontSize,
    isMobile,
    isTablet,
  }
}
