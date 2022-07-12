import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { removeUndefinedNullFromObject } from 'Utils'
import { ShowEpisodesTMDB } from '../TmdbAPIHelpers/getShowEpisodesFromAPI'
import { UserShowStatuses } from '../UseUserShowsRed/@Types'

type AddShowToFireDatabase = {
  firebase: FirebaseInterface
  showDetailesTMDB: MainDataTMDB
  showEpisodesTMDB: ShowEpisodesTMDB
  database: UserShowStatuses
}

const addShowToFireDatabase = async ({
  showDetailesTMDB,
  showEpisodesTMDB,
  database,
  firebase,
}: AddShowToFireDatabase) =>
  firebase.showFullDataFireDatabase(showDetailesTMDB.id).transaction((snapshot) => {
    if (snapshot !== null) {
      return
    }

    const shotDetailesNoUndefined: MainDataTMDB = removeUndefinedNullFromObject(showDetailesTMDB)
    return {
      info: {
        ...shotDetailesNoUndefined,
      },
      episodes: showEpisodesTMDB.episodes,
      id: showDetailesTMDB.id.toString(),
      status: showDetailesTMDB.status,
      usersWatching: database === 'watchingShows' ? 1 : 0,
    }
  })

export default addShowToFireDatabase
