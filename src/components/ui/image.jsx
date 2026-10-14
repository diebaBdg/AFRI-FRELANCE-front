import * as React from "react"
import { cn } from "@/lib/utils"

const FALLBACK_IMAGE_URL =
  "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png"

const Image = React.forwardRef(
  (
    {
      src,
      fittingType = "cover",
      className,
      onError,
      ...props
    },
    ref
  ) => {
    const [error, setError] = React.useState(false)

    React.useEffect(() => {
      setError(false)
    }, [src])

    const handleError = (e) => {
      setError(true)
      onError?.(e)
    }

    const imgSrc = !src || error ? FALLBACK_IMAGE_URL : src

    return (
      <img
        ref={ref}
        src={imgSrc}
        loading="lazy"
        className={cn(
          "object-cover",
          fittingType === "fit" && "object-contain",
          className
        )}
        onError={handleError}
        {...props}
      />
    )
  }
)
Image.displayName = "Image"

export { Image }
