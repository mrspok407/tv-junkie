/* eslint-disable array-callback-return */
import { EpisodesFromFireDatabase, SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import { currentDate } from 'Utils'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'

export const releasedEpisodesToOneArray = ({ data }: { data: EpisodesFromFireDatabase[] | undefined }) => {
  if (!Array.isArray(data)) return []

  return data
    .reduce((acc, season) => {
      const seasonEpisodes = season?.episodes?.filter(Boolean)
      if (!Array.isArray(seasonEpisodes) || seasonEpisodes.length === 0) return acc

      const episodesWithIndex = seasonEpisodes.map((episode, index) => {
        return { ...episode, index }
      })
      acc.push(...episodesWithIndex)
      return acc
    }, [] as SingleEpisodeFromFireDatabase[])
    .filter((episode) => {
      const daysToNewEpisode = differenceInCalendarDays(new Date(episode.air_date), currentDate)
      return daysToNewEpisode <= 0 && episode
    })
}

export default releasedEpisodesToOneArray
