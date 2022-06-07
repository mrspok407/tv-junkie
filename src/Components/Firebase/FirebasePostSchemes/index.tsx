import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { EpisodesFromUserDatabase } from '../@TypesFirebase'
import { FirebaseInterface } from '../FirebaseContext'

interface PostScheme {
  authUid: string
  showDetailesTMDB: MainDataTMDB
  showEpisodes: EpisodesFromUserDatabase['episodes']
  showDatabase: string
  firebase: FirebaseInterface
}

export const postUserShowScheme = ({ authUid, showDetailesTMDB, showEpisodes, showDatabase, firebase }: PostScheme) => {
  const showsSubDatabase =
    showDetailesTMDB.status === 'Ended' || showDetailesTMDB.status === 'Canceled' ? 'ended' : 'ongoing'

  return {
    [`users/${authUid}/content/shows/${showDetailesTMDB.id}`]: {
      allEpisodesWatched: false,
      database: showDatabase,
      finished: false,
      firstAirDate: showDetailesTMDB.first_air_date,
      id: showDetailesTMDB.id,
      name: showDetailesTMDB.name,
      status: showsSubDatabase,
      timeStamp: firebase.timeStamp(),
    },
    [`users/${authUid}/content/episodes/${showDetailesTMDB.id}`]: {
      episodes: showEpisodes,
      info: {
        database: showDatabase,
        allEpisodesWatched: false,
        isAllWatched_database: `false_${showDatabase}`,
        finished: false,
      },
    },
    [`users/${authUid}/content/showsLastUpdateList/${showDetailesTMDB.id}/lastUpdatedInUser`]: firebase.timeStamp(),
    [`allShowsList/${showDetailesTMDB.id}/usersWatching`]: firebase.ServerValueIncrement(
      showDatabase === 'watchingShows' ? 1 : 0,
    ),
  }
}
