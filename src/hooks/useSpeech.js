import { useState, useCallback } from 'react'

function getBestSpanishVoice() {
  const voices = window.speechSynthesis.getVoices()
  // Prefer online Google voices (Chrome) — best quality
  const googleES = voices.find(v => v.name.includes('Google') && v.lang.startsWith('es'))
  if (googleES) return googleES
  // Any Spanish voice
  const anyES = voices.find(v => v.lang.startsWith('es'))
  if (anyES) return anyES
  // Fallback: any voice, just set lang to es-ES
  return null
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return

    window.speechSynthesis.cancel()
    setSpeaking(false)

    const doSpeak = () => {
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
      window.speechSynthesis.speak(utterance)
    }

    // Chrome loads voices async — wait if not ready yet
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      doSpeak()
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null
        doSpeak()
      }
    }
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  return { speak, stop, speaking }
}
