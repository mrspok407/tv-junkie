/* eslint-disable array-callback-return */
import { SeasonEpisodesFromDatabaseInterface } from "Components/UserContent/UseUserShows/UseUserShows"
import { differenceBtwDatesInDays, todayDate } from "Utils"

export const releasedEpisodes = ({ data }: { data: SeasonEpisodesFromDatabaseInterface[] }) => {
  // if (!Array.isArray(data)) {
  //   throw new Error("Provided data should be an array")
  // }
  const modifiedData = Array.isArray(data)
    ? data
        .reduce((acc: any, season) => {
          const seasonEpisodes = season.episodes.filter(() => true)
          if (!Array.isArray(seasonEpisodes) || seasonEpisodes.length === 0) return
          acc.push(...seasonEpisodes)
          return acc
        }, [])
        .filter((episode: any) => {
          const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)
          if (episode.air_date === null) {
            console.log(differenceBtwDatesInDays(episode.air_date, todayDate))
            console.log(differenceBtwDatesInDays(episode.air_date, todayDate) <= 0)
          }
          return daysToNewEpisode <= 0 && episode
        })
    : []

  return modifiedData
}

export default releasedEpisodes
