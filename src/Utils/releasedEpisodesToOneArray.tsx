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
          const episodesWithIndex = seasonEpisodes.reduce((acc: any, episode: any, index: any) => {
            acc.push({ ...episode, index })
            return acc
          }, [])
          acc.push(...episodesWithIndex)
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
