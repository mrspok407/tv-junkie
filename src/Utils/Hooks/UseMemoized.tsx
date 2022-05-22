import { useCallback } from 'react'

interface GenericIdentityFn<ReturnType, ArgumentType> {
  (arg: ArgumentType): ReturnType
}

function useMemoized<ReturnType, ArgumentType>({ deps, callback }: { deps: any[]; callback: any }) {
  const memoized = () => {
    const cache = new Map()
    return (...args: any): ReturnType => {
      const strX = JSON.stringify(args)
      if (!cache.has(strX)) {
        cache.set(
          strX,
          callback(...args).catch((error: any) => {
            cache.delete(strX)
            return error
          }),
        )
      }
      return cache.get(strX)
    }
  }

  const memoizedCallback: GenericIdentityFn<ReturnType, ArgumentType> = useCallback(memoized(), deps)
  return memoizedCallback
}

export default useMemoized
