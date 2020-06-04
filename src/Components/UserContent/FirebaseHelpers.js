export const toggleWatchingShowsDatabase = (firebase, userUid, key, userWatching) => {
  firebase
    .watchingShows(userUid)
    .child(key)
    .update({ userWatching: userWatching })
}

export const deleteShowFromSubDatabase = (firebase, userUid, dataBases, key) => {
  if (!key) return Promise.resolve()

  const promises = []

  dataBases.forEach(item => {
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

  return Promise.all(promises)
}
