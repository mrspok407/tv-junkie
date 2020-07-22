import { differenceBtwDatesInDays } from "Utils"

export const checkIfAllEpisodesWatched = ({ show, firebase, authUser, todayDate }) => {
  const allShowsListSubDatabase = show.info.status

  firebase.showEpisodes(allShowsListSubDatabase, show.info.id).once("value", snapshot => {
    let allEpisodesDatabase = []

    snapshot.val().forEach(item => {
      allEpisodesDatabase = [...allEpisodesDatabase, ...item.episodes]
    })

    const releasedEpisodes = allEpisodesDatabase.filter(episode => {
      const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)
      return daysToNewEpisode < 0 && episode
    })

    firebase.userShowAllEpisodes(authUser.uid, show.info.id, show.database).once("value", snapshot => {
      let allEpisodes = []

      snapshot.val().forEach(item => {
        allEpisodes = [...allEpisodes, ...item.episodes]
      })

      allEpisodes.splice(releasedEpisodes.length)

      const allEpisodesWatched = !allEpisodes.some(episode => !episode.watched)

      const finished = allShowsListSubDatabase === "ended" && allEpisodesWatched ? true : false

      firebase.userShow(authUser.uid, show.info.id, show.database).update({
        allEpisodesWatched,
        finished_and_name: `${finished}_${show.info.name || show.info.original_name}`,
        finished_and_timeStamp: `${finished}_${3190666598976 - show.info.timeStamp * -1}`
      })
    })
  })
}
