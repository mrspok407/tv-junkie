import { useCallback } from "react"

type Props = {
  deps: any[]
}

const useMemoized = ({ deps }: Props) => {
  const memoized = useCallback(
    (fn: any) => {
      const cache = new Map()
      return (...args: any) => {
        const strX = JSON.stringify(args)
        if (!cache.has(strX)) {
          cache.set(
            strX,
            fn(...args).catch((error: any) => {
              cache.delete(strX)
              return error
            })
          )
        }
        return cache.get(strX)
      }
    },
    [deps]
  ) // eslint-disable-line react-hooks/exhaustive-deps

  return memoized
}

export default useMemoized
