import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { removeUndefinedNullFromObject } from 'Utils'
import { ShowEpisodesTMDB } from '../TmdbAPIHelpers/getShowEpisodesFromAPI'

type AddShowToFireDatabase = {
  firebase: FirebaseInterface
  showDetailesTMDB: MainDataTMDB
  showEpisodesTMDB: ShowEpisodesTMDB
}

const addShowToFireDatabase = async ({ showDetailesTMDB, showEpisodesTMDB, firebase }: AddShowToFireDatabase) =>
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
    }
  })

export default addShowToFireDatabase
