import { differenceBtwDatesInDays, todayDate } from "Utils"

export const organiseFutureEpisodesByMonth = data => {
  const sortedAndFiltered = data
    .flatMap(show =>
      show.episodes.flatMap(season =>
        season.episodes.reduce((acc, episode) => {
          if (differenceBtwDatesInDays(episode.air_date, todayDate) > 0) {
            acc.push({ ...episode, show: show.info.name || show.info.original_name })
          }

          return acc
        }, [])
      )
    )
    .sort((a, b) => (a.air_date > b.air_date ? 1 : -1))

  const uniqueMonths = sortedAndFiltered
    .map(episode => episode.air_date.slice(0, 7))
    .filter((month, index, array) => array.indexOf(month) === index)

  const episodesByMonths = uniqueMonths.reduce((acc, month) => {
    const episodes = sortedAndFiltered.reduce((acc, episode) => {
      if (episode.air_date.slice(0, 7) === month) acc.push(episode)
      return acc
    }, [])

    acc.push({ month, episodes })

    return acc
  }, [])

  return episodesByMonths
}
