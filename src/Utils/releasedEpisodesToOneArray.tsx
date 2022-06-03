/* eslint-disable array-callback-return */
import { EpisodesFromFireDatabase } from 'Components/Firebase/@Types'
import { differenceBtwDatesInDays, todayDate } from 'Utils'

export const releasedEpisodes = ({ data }: { data: EpisodesFromFireDatabase[] }) => {
  const modifiedData = Array.isArray(data)
    ? data
        .reduce((acc: any, season) => {
          const seasonEpisodes = season?.episodes?.filter(() => true)
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
