import { differenceBtwDatesInDays } from "Utils"

export const checkIfAllEpisodesWatched = ({ show, firebase, authUser, todayDate }) => {
  const allShowsListSubDatabase =
    show.info.status === "Ended" || show.info.status === "Canceled" ? "ended" : "ongoing"

  firebase.showEpisodes(allShowsListSubDatabase, show.info.id).once("value", snapshot => {
    let allEpisodesDatabase = []

    snapshot.val().forEach(item => {
      allEpisodesDatabase = [...allEpisodesDatabase, ...item.episodes]
    })

    const releasedEpisodes = allEpisodesDatabase.filter(episode => {
      const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)
      return daysToNewEpisode < 0 && episode
    })

    console.log(releasedEpisodes)

    firebase.userShowAllEpisodes(authUser.uid, show.info.id, show.database).once("value", snapshot => {
      let allEpisodes = []

      snapshot.val().forEach(item => {
        allEpisodes = [...allEpisodes, ...item.episodes]
      })

      allEpisodes.splice(releasedEpisodes.length)
      console.log(allEpisodes)

      const allEpisodesWatched = !allEpisodes.some(episode => !episode.watched)

      firebase.userShow(authUser.uid, show.info.id, show.database).update({
        allEpisodesWatched
      })
    })
  })
}

export const toggleWatchingShowsDatabase = (
  firebase,
  userUid,
  key,
  userWatching,
  dropped = false,
  willWatch = false
) => {
  firebase
    .watchingShows(userUid)
    .child(key)
    .update({ userWatching: userWatching, databases: { droppedShows: dropped, willWatchShows: willWatch } })
}

export const deleteShowFromSubDatabase = (firebase, userUid, dataBases, id) => {
  // if (!key) return Promise.resolve()

  const promises = []

  console.log(dataBases)

  dataBases.forEach(item => {
    const promise = firebase[item](userUid)
      .orderByChild("id")
      .equalTo(id)
      .once("value", snapshot => {
        if (snapshot.val() !== null) {
          const show = snapshot.val()
            ? Object.keys(snapshot.val()).map(key => ({
                ...snapshot.val()[key]
              }))
            : []

          console.log(show[0])

          firebase[item](userUid)
            .child(show[0].key)
            .remove()
        }
      })
    // .child(key)
    // .once("value", snapshot => {
    //   if (snapshot.val() !== null) {
    //     firebase[item](userUid)
    //       .child(key)
    //       .remove()
    //   }
    // })

    promises.push(promise)
  })

  return Promise.all(promises)
}
