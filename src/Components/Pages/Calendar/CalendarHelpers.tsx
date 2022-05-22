import {
  SingleEpisodeByMonthInterface,
  UserShowsInterface,
  UserWillAirEpisodesInterface,
} from 'Components/UserContent/UseUserShowsRed/@Types'
import { differenceBtwDatesInDays, todayDate } from 'Utils'

export const organiseFutureEpisodesByMonth = (data: UserShowsInterface[], episodes: any) => {
  const sortedAndFiltered = data
    .flatMap((show) => episodes[show.id].flatMap((season: any) => season.episodes.reduce(
          (acc: { show: string; showId: number; episode_number?: number; air_date: any }[], episode: any) => {
            if (differenceBtwDatesInDays(episode.air_date, todayDate) >= 0) {
              acc.push({
                ...episode,
                show: show.name || show.original_name,
                showId: show.id,
                episode_number: episode?.episode_number,
              })
            }

            return acc
          },
          [],
        )))
    .sort((a, b) => (a.air_date > b.air_date ? 1 : -1))

  const uniqueMonths = sortedAndFiltered
    .map((episode) => episode.air_date && episode.air_date.slice(0, 7))
    .filter((month, index, array) => array.indexOf(month) === index)

  const episodesByMonths: UserWillAirEpisodesInterface[] = uniqueMonths.reduce(
    (acc: { month: string; episodes: SingleEpisodeByMonthInterface[] }[], month) => {
      const monthNew = month.concat('-01')
      const episodes = sortedAndFiltered.reduce((acc: SingleEpisodeByMonthInterface[], episode) => {
        if (episode.air_date && episode.air_date.slice(0, 7) === month) {
          acc.push(episode)
        }
        return acc
      }, [])

      acc.push({ month: monthNew, episodes })

      return acc
    },
    [],
  )

  return episodesByMonths
}

export const organizeMonthEpisodesByEpisodeNumber = (data: SingleEpisodeByMonthInterface[]) => {
  const uniqueDates = data
    .map((episode) => episode.air_date)
    .filter((episode, index, array) => array.indexOf(episode) === index)

  const monthEpisodes = uniqueDates.reduce((acc: SingleEpisodeByMonthInterface[], uniqueDate) => {
    const episodesInDate = data.filter((episode) => episode.air_date === uniqueDate)

    const uniqueShows = episodesInDate
      .map((episode) => episode.show)
      .filter((show, index, array) => array.indexOf(show) === index)

    const sortedEpisodes = uniqueShows.reduce((acc: SingleEpisodeByMonthInterface[], show) => {
      const filteredByShows = episodesInDate
        .filter((episode) => episode.show === show)
        .sort((a, b) => {
          if (a.episode_number && b.episode_number) {
            return a.episode_number > b.episode_number ? 1 : -1
          }
            return 1
        })

      acc.push(...filteredByShows)

      return acc
    }, [])

    acc.push(...sortedEpisodes)
    return acc
  }, [])

  return monthEpisodes
}
