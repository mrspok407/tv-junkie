/* eslint-disable array-callback-return */
import { combineMergeObjects } from "Utils"
import merge from "deepmerge"

export const episodesWithAirDate = ({ fullData, userData }) => {
  if (!Array.isArray(fullData) || !Array.isArray(userData)) {
    throw new Error("Provided data should be an array")
  }

  const episodesWithAirDate = merge(fullData, userData, {
    arrayMerge: combineMergeObjects,
  }).reduce((acc, season) => {
    if (!Array.isArray(season.episodes) || season.episodes.length === 0) return

    const episodes = season.episodes.reduce((acc, episode) => {
      acc.push({
        air_date: episode.air_date || null,
        userRating: episode.userRating,
        watched: episode.watched,
      })
      return acc
    }, [])
    acc.push({
      season_number: season.season_number,
      userRating: season.userRating,
      episodes,
    })
    return acc
  }, [])

  return episodesWithAirDate
}

export default episodesWithAirDate
