import { differenceBtwDatesInDays } from "Utils"

export const checkIfAllEpisodesWatched = ({ show, firebase, authUser, todayDate }) => {
  const showsSubDatabase = show.info.status

  firebase.showEpisodes(showsSubDatabase, show.info.id).once("value", snapshot => {
    const allEpisodesDatabase = snapshot.val().reduce((acc, item) => {
      acc.push(...item.episodes)
      return acc
    }, [])

    const releasedEpisodes = allEpisodesDatabase.filter(episode => {
      const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)
      return daysToNewEpisode <= 0 && episode
    })

    firebase.userShowAllEpisodes(authUser.uid, show.info.id, show.database).once("value", snapshot => {
      const allEpisodes = snapshot.val().reduce((acc, item) => {
        acc.push(...item.episodes)
        return acc
      }, [])

      allEpisodes.splice(releasedEpisodes.length)

      const allEpisodesWatched = !allEpisodes.some(episode => !episode.watched)

      const finished = showsSubDatabase === "ended" && allEpisodesWatched ? true : false

      firebase.userShow({ uid: authUser.uid, key: show.info.id, database: show.database }).update({
        allEpisodesWatched,
        finished_and_name: `${finished}_${show.info.name || show.info.original_name}`,
        finished_and_timeStamp: `${finished}_${3190666598976 - show.info.timeStamp * -1}`
      })
    })
  })
}
