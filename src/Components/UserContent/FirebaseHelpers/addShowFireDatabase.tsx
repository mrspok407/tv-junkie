import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { removeUndefinedNullFromObject } from 'Utils'
import { ShowEpisodesTMDB } from '../TmdbAPIHelpers/getShowEpisodesFromAPI'

type Arguments = {
  firebase: FirebaseInterface
  showDetailesTMDB: MainDataTMDB
  showEpisodesTMDB: ShowEpisodesTMDB
  database: string
}

const addShowToFireDatabase = ({ showDetailesTMDB, showEpisodesTMDB, database, firebase }: Arguments) =>
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
