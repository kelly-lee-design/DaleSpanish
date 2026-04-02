import { useState, useCallback } from 'react'

function getBestSpanishVoice() {
  const voices = window.speechSynthesis.getVoices()
  const googleES = voices.find(v => v.name.includes('Google') && v.lang.startsWith('es'))
  if (googleES) return googleES
  const anyES = voices.find(v => v.lang.startsWith('es'))
  if (anyES) return anyES
  return null
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return

    window.speechSynthesis.cancel()
    setSpeaking(false)

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = getBestSpanishVoice()
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    } else {
      utterance.lang = 'es-ES'
    }
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    // Speak immediately (required for iOS — must be synchronous with user gesture)
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  return { speak, stop, speaking }
}
