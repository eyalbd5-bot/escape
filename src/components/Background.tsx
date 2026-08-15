import { useEffect, useRef, useState } from 'react'

/**
 * Fixed full-screen background: a gradient base with a vacation photo on top,
 * plus a scrim for text contrast. When a destination image arrives it crossfades
 * in (spec §11.2). Falls back to the static beach on error / before selection.
 */
const BEACH =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80'

interface Props {
  imageUrl?: string | null
}

export default function Background({ imageUrl }: Props) {
  const [src, setSrc] = useState(BEACH)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const target = imageUrl || BEACH
    if (target === src) return
    const img = imgRef.current
    if (!img) {
      setSrc(target)
      return
    }
    img.style.opacity = '0'
    const t = setTimeout(() => setSrc(target), 250)
    return () => clearTimeout(t)
  }, [imageUrl, src])

  return (
    <>
      <div id="bg">
        <img
          ref={imgRef}
          id="bgimg"
          src={src}
          alt=""
          onLoad={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.opacity = '1'
          }}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
      <div id="scrim" />
    </>
  )
}
