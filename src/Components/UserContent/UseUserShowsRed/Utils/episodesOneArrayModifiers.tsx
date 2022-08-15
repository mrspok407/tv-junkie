import { currentDate } from 'Utils'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'

interface SeasonInt {
  episodes: Array<any>
}

type DataType = Array<Partial<SeasonInt> | undefined> | undefined

export const episodesToOneArray = <T,>(data: DataType): T[] => {
  if (!Array.isArray(data)) return []
  return data.reduce((acc, season) => {
    const seasonEpisodes = season?.episodes?.filter(Boolean)
    if (!Array.isArray(seasonEpisodes) || seasonEpisodes.length === 0) return acc

    const seasonEpisodesWithIndex = seasonEpisodes.map((episode, index) => {
      return { ...episode, index }
    })
    acc.push(...seasonEpisodesWithIndex)
    return acc
  }, [] as T[])
}

export const releasedEpisodesToOneArray = <T,>(data: DataType) => {
  if (!Array.isArray(data)) return []
  return episodesToOneArray<T>(data).filter((episode: any) => {
    const daysToNewEpisode = differenceInCalendarDays(new Date(episode.air_date), currentDate)
    return daysToNewEpisode <= 0
  })
}
