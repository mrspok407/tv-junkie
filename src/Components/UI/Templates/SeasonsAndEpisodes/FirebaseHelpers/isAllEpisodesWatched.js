const isAllEpisodesWatched = ({ showInfo, releasedEpisodes, authUser, firebase, singleEpisode }) => {
  const status = showInfo.status === "Ended" || showInfo.status === "Canceled" ? "ended" : "ongoing"
  const allEpisodesWatched = singleEpisode
    ? releasedEpisodes.filter((episode) => !episode.watched).length === 1
    : releasedEpisodes
        .map((episode) => episode.season_number)
        .filter((episode, index, array) => array.indexOf(episode) === index).length === 1

  const finished = (status === "ended" || showInfo.status === "ended") && allEpisodesWatched ? true : false

  if (allEpisodesWatched) {
    firebase.userShowAllEpisodesInfo(authUser.uid, showInfo.id).update({
      allEpisodesWatched,
      finished,
      isAllWatched_database: `${allEpisodesWatched}_${showInfo.database}`
    })

    console.log("isAllEpisodesWatched")

    firebase.userShow({ uid: authUser.uid, key: showInfo.id }).update({ finished, allEpisodesWatched })
  }
}

export default isAllEpisodesWatched
