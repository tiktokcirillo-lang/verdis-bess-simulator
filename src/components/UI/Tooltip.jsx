import { useState } from 'react'

function Tooltip({ content, children }) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max max-w-xs">
          <span className="block bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2 shadow-xl">
            {content}
          </span>
        </span>
      )}
    </span>
  )
}

export default Tooltip
