import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCheck, Trash2 } from 'lucide-react'

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

export default function NotificationCenter({
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  removeNotification,
  onClose,
  onNavigate,
  character,
}) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-50"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="fixed top-16 left-2 right-2 md:left-auto md:right-4 md:w-[400px] z-50 bg-white rounded-[24px] shadow-2xl border border-gray-100 overflow-hidden max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-gray-900">알림</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[#FF5722] text-white text-[11px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <motion.button
                onClick={markAllAsRead}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-[#FF5722] bg-[#FF5722]/10 hover:bg-[#FF5722]/20 transition-colors"
              >
                <CheckCheck size={14} />
                모두 읽음
              </motion.button>
            )}
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-gray-400" />
            </motion.button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 px-6">
              {character && (
                <div className="w-24 h-24 overflow-hidden rounded-full mb-4">
                  <img
                    src={character.src}
                    alt="character"
                    className="w-[180%] h-[180%] object-cover -ml-[40%] -mt-[20%]"
                  />
                </div>
              )}
              <p className="text-base font-bold text-gray-700 text-center">
                아직 소식이 없어요
              </p>
              <p className="text-sm text-gray-400 text-center mt-1">
                오늘도 ¡DALE! 해볼까요? 🍊
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {notifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  onClick={() => {
                    markAsRead(notif.id)
                    if (notif.action && onNavigate) {
                      onNavigate(notif.action)
                      onClose()
                    }
                  }}
                  className={`relative cursor-pointer px-5 py-4 border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                    !notif.read ? 'bg-[#FFF3E0]' : ''
                  }`}
                >
                  {/* Unread indicator */}
                  {!notif.read && (
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#FF5722] rounded-r-full" />
                  )}

                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 text-lg ${
                      !notif.read ? 'bg-[#FF5722]/15' : 'bg-gray-100'
                    }`}>
                      {notif.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${!notif.read ? 'text-gray-900' : 'text-gray-500'}`}>
                        {notif.title}
                      </p>
                      <p className={`text-xs mt-0.5 ${!notif.read ? 'text-gray-600' : 'text-gray-400'}`}>
                        {notif.body}
                      </p>
                      <p className="text-[11px] text-gray-300 mt-1.5">{timeAgo(notif.timestamp)}</p>
                    </div>

                    {/* Delete */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notif.id)
                      }}
                      whileTap={{ scale: 0.8 }}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 self-center"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </>
  )
}
