import { useEffect, useRef } from 'react'

function PageTransition({ children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.add('page-enter')
    requestAnimationFrame(() => {
      el.classList.remove('page-enter')
      el.classList.add('page-active')
    })
  }, [])

  return (
    <div ref={ref} className="page-enter">
      {children}
    </div>
  )
}

export default PageTransition
