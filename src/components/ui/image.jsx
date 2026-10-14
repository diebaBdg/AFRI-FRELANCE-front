import * as React from "react"
import { cn } from "@/lib/utils"

const FALLBACK_IMAGE_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiLz48Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIvPjxwYXRoIGQ9Im03IDIxIDQgLTggNSA1IDQgMnoiLz48L3N2Zz4="

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
