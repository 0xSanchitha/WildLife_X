import { useEffect, useRef, useState } from 'react'


export default function useInView({ threshold = 0.15, triggerOnce = true } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (triggerOnce) observer.unobserve(node)
        } else if (!triggerOnce) {
          setInView(false)
        }
      },
      { threshold }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, triggerOnce])

  return [ref, inView]
}
