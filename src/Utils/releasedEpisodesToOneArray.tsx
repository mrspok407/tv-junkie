/* eslint-disable array-callback-return */
import { EpisodesFromFireDatabase, SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import { differenceBtwDatesInDays, currentDate } from 'Utils'

export const releasedEpisodes = ({ data }: { data: EpisodesFromFireDatabase[] | undefined }) => {
  if (Array.isArray(data)) {
    return data
      .reduce((acc, season) => {
        const seasonEpisodes = season?.episodes?.filter(() => true)
        if (!Array.isArray(seasonEpisodes) || seasonEpisodes.length === 0) return acc

        const episodesWithIndex = seasonEpisodes.map((episode, index) => {
          return { ...episode, index }
        })
        acc.push(...episodesWithIndex)
        return acc
      }, [] as SingleEpisodeFromFireDatabase[])
      .filter((episode) => {
        const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, currentDate)
        return daysToNewEpisode <= 0 && episode
      })
  }
  return []
}

export default releasedEpisodes
