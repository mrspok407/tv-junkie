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
