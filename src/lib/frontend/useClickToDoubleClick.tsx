import { useState } from 'react'

export const useClickToDoubleClick = (doubleClickFn: () => void) => {
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleClick = () => {
    if (clickTimeout === null) {
      // This is the first click
      const newTimeout = setTimeout(() => {
        // After the delay, if no second click, clear the timeout and consider it a single click
        setClickTimeout(null) // Reset for the next click sequence
      }, 500) // 500 ms delay for the second click to be considered a double click
      setClickTimeout(newTimeout)
    } else {
      // This is the second click (double click)
      clearTimeout(clickTimeout) // Prevent the single click action
      setClickTimeout(null) // Reset for the next click sequence
      doubleClickFn() // Handle the double click action
    }
  }

  return handleClick
}
