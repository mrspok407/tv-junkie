/* eslint-disable array-callback-return */
import { SeasonEpisodesFromDatabaseInterface } from "Components/UserContent/UseUserShows"
import { differenceBtwDatesInDays, todayDate } from "Utils"

export const releasedEpisodes = ({ data }: { data: SeasonEpisodesFromDatabaseInterface[] }) => {
  // if (!Array.isArray(data)) {
  //   throw new Error("Provided data should be an array")
  // }
  const modifiedData = Array.isArray(data)
    ? data
        .reduce((acc: any, season) => {
          if (!Array.isArray(season.episodes) || season.episodes.length === 0) return
          acc.push(...season.episodes)
          return acc
        }, [])
        .filter((episode: any) => {
          const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)
          return daysToNewEpisode <= 0 && episode
        })
    : []

  return modifiedData
}

export default releasedEpisodes
