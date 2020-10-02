/* eslint-disable array-callback-return */
import { differenceBtwDatesInDays, todayDate } from "Utils"

export const releasedEpisodes = ({ data }) => {
  console.log(data)
  if (!Array.isArray(data)) {
    throw new Error("Provided data should be an array")
  }
  const modifiedData = data
    .reduce((acc, season) => {
      if (!Array.isArray(season.episodes) || season.episodes.length === 0) return
      acc.push(...season.episodes)
      return acc
    }, [])
    .filter(episode => {
      const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)
      return daysToNewEpisode <= 0 && episode
    })

  return modifiedData
}

export default releasedEpisodes
