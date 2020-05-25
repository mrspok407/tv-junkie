export const toggleWatchingTvShowDataBase = (firebase, showId, userUid, userWatching) => {
  firebase
    .userWatchingTvShows(userUid)
    .orderByChild("id")
    .equalTo(showId)
    .once("value", snapshot => {
      const updates = {}
      snapshot.forEach(
        child =>
          (updates[child.key] = {
            ...snapshot.val()[child.key],
            userWatching: userWatching
          })
      )
      firebase.userWatchingTvShows(userUid).update(updates)
    })
}

export const deleteTvShowFromSubDataBase = (firebase, userUid, dataBase, key) => {
  if (!key) return Promise.resolve()

  const promises = []

  dataBase.forEach(item => {
    const promise = firebase[item](userUid)
      .child(key)
      .once("value", snapshot => {
        if (snapshot.val() !== null) {
          firebase[item](userUid)
            .child(key)
            .remove()
        }
      })

    promises.push(promise)
  })

  console.log(promises)
  return Promise.all(promises)
}
