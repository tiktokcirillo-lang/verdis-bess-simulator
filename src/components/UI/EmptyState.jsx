function EmptyState({ icon = '⚡', title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-3xl mb-5">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition text-sm"
        >
          {action}
        </button>
      )}
    </div>
  )
}

export default EmptyState
