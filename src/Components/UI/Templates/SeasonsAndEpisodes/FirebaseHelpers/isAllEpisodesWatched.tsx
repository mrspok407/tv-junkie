import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { EpisodesFromFireDatabase, SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import { AuthUserInterface } from 'Components/UserAuth/Session/WithAuthentication/@Types'
import { differenceBtwDatesInDays, todayDate } from 'Utils'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

interface Arguments {
  showInfo: MainDataTMDB
  releasedEpisodes: SingleEpisodeFromFireDatabase[]
  episodesFromDatabase: EpisodesFromFireDatabase[]
  authUser: AuthUserInterface['authUser']
  firebase: FirebaseInterface
  isSingleEpisode?: boolean
  multipleEpisodes?: number
}

const isAllEpisodesWatched = ({
  showInfo,
  releasedEpisodes,
  episodesFromDatabase,
  authUser,
  firebase,
  isSingleEpisode,
  multipleEpisodes,
}: Arguments) => {
  const status = showInfo.status === 'Ended' || showInfo.status === 'Canceled' ? 'ended' : 'ongoing'
  const allEpisodes = episodesFromDatabase.reduce((acc: SingleEpisodeFromFireDatabase[], item) => {
    acc.push(...item.episodes.filter((item) => item.air_date !== ''))
    return acc
  }, [])

  const allEpisodesWatched = isSingleEpisode
    ? allEpisodes.filter((episode) => !episode.watched).length === 1
    : multipleEpisodes
    ? allEpisodes.filter((episode) => !episode.watched).length === multipleEpisodes
    : allEpisodes
        .map((episode) => episode.season_number)
        .filter((episode, index, array) => array.indexOf(episode) === index).length === 1 &&
      !allEpisodes.some((episode) => !episode.watched)

  const releasedEpisodesWatched = isSingleEpisode
    ? releasedEpisodes.filter((episode) => !episode.watched).length === 1
    : multipleEpisodes
    ? releasedEpisodes.filter((episode) => !episode.watched).length === multipleEpisodes
    : releasedEpisodes
        .map((episode) => episode.season_number)
        .filter((episode, index, array) => array.indexOf(episode) === index).length === 1

  const isAllEpisodesAired = allEpisodes.some((episode) => {
    const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)
    return daysToNewEpisode > 0
  })
    ? allEpisodesWatched
    : releasedEpisodesWatched

  const finished = !!((status === 'ended' || showInfo.status === 'ended') && isAllEpisodesAired)

  // if (releasedEpisodesWatched) {
  firebase.userShowAllEpisodesInfo(authUser.uid, showInfo.id).update({
    allEpisodesWatched: releasedEpisodesWatched,
    finished,
    isAllWatched_database: `${releasedEpisodesWatched}_${showInfo.database}`,
  })

  firebase
    .userShow({ uid: authUser.uid, key: showInfo.id })
    .update({ finished, allEpisodesWatched: releasedEpisodesWatched })
  // }
}

export default isAllEpisodesWatched
