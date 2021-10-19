const useMemoized = () => {
  const memoized = (fn: any) => {
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
  }
  return memoized
}

export default useMemoized
