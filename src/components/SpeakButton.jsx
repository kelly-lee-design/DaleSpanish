import { Volume2, VolumeX } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'

export default function SpeakButton({ text, lang = 'es-ES', size = 'sm', className = '' }) {
  const { speak, stop, speaking } = useSpeech()

  const handleClick = (e) => {
    e.stopPropagation()
    speaking ? stop() : speak(text, lang)
  }

  const sizeClass = size === 'lg'
    ? 'p-2.5 rounded-xl'
    : 'p-1.5 rounded-lg'

  const iconSize = size === 'lg' ? 18 : 14

  return (
    <button
      onClick={handleClick}
      title={speaking ? '정지' : '듣기'}
      className={`flex-shrink-0 transition-all ${sizeClass} ${
        speaking
          ? 'bg-[#FF5722] text-white'
          : 'text-gray-400 hover:text-[#FF5722] hover:bg-orange-50'
      } ${className}`}
    >
      {speaking
        ? <VolumeX size={iconSize} />
        : <Volume2 size={iconSize} />
      }
    </button>
  )
}
