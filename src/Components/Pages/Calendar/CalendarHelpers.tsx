import { UserShowsInterface, UserWillAirEpisodesInterface } from "Components/UserContent/UseUserShows"
import { differenceBtwDatesInDays, todayDate } from "Utils"

interface SingleEpisodeByMonthInterface {
  show: string
  air_date: string
  showId: number
}

export const organiseFutureEpisodesByMonth = (data: UserShowsInterface[]) => {
  console.log({ organiseFutureEpisodesByMonth_INPUT_DATA: data })
  const sortedAndFiltered = data
    .flatMap((show) => {
      return show.episodes.flatMap((season) =>
        season.episodes.reduce((acc: SingleEpisodeByMonthInterface[], episode) => {
          if (differenceBtwDatesInDays(episode.air_date, todayDate) >= 0) {
            acc.push({ ...episode, show: show.name || show.original_name, showId: show.id })
          }

          return acc
        }, [])
      )
    })
    .sort((a, b) => (a.air_date > b.air_date ? 1 : -1))

  const uniqueMonths = sortedAndFiltered
    .map((episode) => episode.air_date.slice(0, 7))
    .filter((month, index, array) => array.indexOf(month) === index)

  const episodesByMonths: UserWillAirEpisodesInterface[] = uniqueMonths.reduce(
    (acc: { month: string; episodes: SingleEpisodeByMonthInterface[] }[], month) => {
      const monthNew = month.concat("-01")
      const episodes = sortedAndFiltered.reduce((acc: SingleEpisodeByMonthInterface[], episode) => {
        if (episode.air_date.slice(0, 7) === month) {
          acc.push(episode)
        }
        return acc
      }, [])

      acc.push({ month: monthNew, episodes })

      return acc
    },
    []
  )

  console.log({ organiseFutureEpisodesByMonth_OUTPUT_DATA: episodesByMonths })

  return episodesByMonths
}

export const organizeMonthEpisodesByEpisodeNumber = (data: any) => {
  console.log(data)
  const uniqueDates = data
    .map((episode: any) => episode.air_date)
    .filter((episode: any, index: any, array: any) => array.indexOf(episode) === index)

  const monthEpisodes = uniqueDates.reduce((acc: any, uniqueDate: any) => {
    const episodesInDate = data.filter((episode: any) => episode.air_date === uniqueDate)

    const uniqueShows = episodesInDate
      .map((episode: any) => episode.show)
      .filter((show: any, index: any, array: any) => array.indexOf(show) === index)

    const sortedEpisodes = uniqueShows.reduce((acc: any, show: any) => {
      const filteredByShows = episodesInDate
        .filter((episode: any) => episode.show === show)
        .sort((a: any, b: any) => (a.episode_number > b.episode_number ? 1 : -1))

      acc.push(...filteredByShows)

      return acc
    }, [])

    acc.push(...sortedEpisodes)
    return acc
  }, [])

  return monthEpisodes
}
