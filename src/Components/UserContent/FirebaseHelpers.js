// import { differenceBtwDatesInDays } from "Utils"

export const checkIfAllEpisodesWatched = ({
  show,
  firebase,
  authUser,
  todayDate,
  allEpisodesFromDatabase
}) => {
  const showsSubDatabase = show.info.status

  const allEpisodes = show.episodes.reduce((acc, item) => {
    acc.push(...item.episodes)
    return acc
  }, [])

  // console.log(showsSubDatabase)
  // console.log(allEpisodesFromDatabase)

  allEpisodes.splice(allEpisodesFromDatabase.length)

  console.log(allEpisodes)

  const allEpisodesWatched = !allEpisodes.some(episode => !episode.watched)

  const finished = showsSubDatabase === "ended" && allEpisodesWatched ? true : false

  firebase.userShow({ uid: authUser.uid, key: show.info.id, database: show.database }).update({
    allEpisodesWatched,
    finished_and_name: `${finished}_${show.info.name || show.info.original_name}`,
    finished_and_timeStamp: `${finished}_${3190666598976 - show.info.timeStamp * -1}`
  })

  // firebase.userShowAllEpisodes(authUser.uid, show.info.id).once("value", snapshot => {
  //   const allEpisodes = snapshot.val().reduce((acc, item) => {
  //     acc.push(...item.episodes)
  //     return acc
  //   }, [])

  //   allEpisodes.splice(allEpisodesFromDatabase.length)

  //   const allEpisodesWatched = !allEpisodes.some(episode => !episode.watched)

  //   const finished = showsSubDatabase === "ended" && allEpisodesWatched ? true : false

  //   firebase.userShow({ uid: authUser.uid, key: show.info.id, database: show.database }).update({
  //     allEpisodesWatched,
  //     finished_and_name: `${finished}_${show.info.name || show.info.original_name}`,
  //     finished_and_timeStamp: `${finished}_${3190666598976 - show.info.timeStamp * -1}`
  //   })
  // })

  // firebase.showEpisodes(showsSubDatabase, show.info.id).once("value", snapshot => {
  //   const allEpisodesDatabase = snapshot.val().reduce((acc, item) => {
  //     acc.push(...item.episodes)
  //     return acc
  //   }, [])

  //   const releasedEpisodes = allEpisodesDatabase.filter(episode => {
  //     const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)
  //     return daysToNewEpisode <= 0 && episode
  //   })

  //   firebase.userShowAllEpisodes(authUser.uid, show.info.id).once("value", snapshot => {
  //     const allEpisodes = snapshot.val().reduce((acc, item) => {
  //       acc.push(...item.episodes)
  //       return acc
  //     }, [])

  //     allEpisodes.splice(releasedEpisodes.length)

  //     const allEpisodesWatched = !allEpisodes.some(episode => !episode.watched)

  //     const finished = showsSubDatabase === "ended" && allEpisodesWatched ? true : false

  //     firebase.userShow({ uid: authUser.uid, key: show.info.id, database: show.database }).update({
  //       allEpisodesWatched,
  //       finished_and_name: `${finished}_${show.info.name || show.info.original_name}`,
  //       finished_and_timeStamp: `${finished}_${3190666598976 - show.info.timeStamp * -1}`
  //     })
  //   })
  // })
}
