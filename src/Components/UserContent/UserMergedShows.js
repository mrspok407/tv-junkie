import { useState, useEffect } from "react"

const SESSION_STORAGE_MERGED_SHOWS = "userMergedShows"

const useMergedShows = () => {
  const [mergedShows, setMergedShows] = useState(
    JSON.parse(sessionStorage.getItem(SESSION_STORAGE_MERGED_SHOWS)) || []
  )

  const handleMergedShows = (id) => {
    setMergedShows([...mergedShows.filter((showId) => showId !== id), id])
  }

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_MERGED_SHOWS, JSON.stringify(mergedShows))
  }, [mergedShows])

  return { mergedShows, handleMergedShows }
}

export default useMergedShows
