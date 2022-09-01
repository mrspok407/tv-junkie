import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { removeUndefinedNullFromObject } from 'Utils'
import { ShowEpisodesTMDB } from '../TmdbAPIHelpers/getShowEpisodesFromAPI'

type AddShowToFireDatabase = {
  firebase: FirebaseInterface
  showDetailsTMDB: MainDataTMDB
  showEpisodesTMDB: ShowEpisodesTMDB
}

const addShowToFireDatabase = async ({ showDetailsTMDB, showEpisodesTMDB, firebase }: AddShowToFireDatabase) =>
  firebase.showFullDataFireDatabase(showDetailsTMDB.id).transaction((snapshot) => {
    if (snapshot !== null) {
      return
    }

    const shotDetailsNoUndefined: MainDataTMDB = removeUndefinedNullFromObject(showDetailsTMDB)
    return {
      info: {
        ...shotDetailsNoUndefined,
      },
      episodes: showEpisodesTMDB.episodes,
      id: showDetailsTMDB.id.toString(),
      status: showDetailsTMDB.status,
      lastUpdatedTimestamp: firebase.timeStamp(),
    }
  })

export default addShowToFireDatabase
