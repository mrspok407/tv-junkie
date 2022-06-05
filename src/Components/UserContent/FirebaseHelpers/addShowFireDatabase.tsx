import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { removeUndefinedNullFromObject } from 'Utils'
import { ShowEpisodesTMDB } from '../TmdbAPIHelpers/getShowEpisodesFromAPI'

type Arguments = {
  firebase: FirebaseInterface
  showDetailesTMDB: MainDataTMDB
  showEpisodesTMDB: ShowEpisodesTMDB
  userShowStatus: string
}

const addShowToFireDatabase = ({
  showDetailesTMDB,
  showEpisodesTMDB,
  userShowStatus,
  firebase,
}: Arguments): Promise<any> =>
  firebase.showFullDataFireDatabase(showDetailesTMDB.id).transaction((snapshot: any) => {
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
      usersWatching: userShowStatus === 'watchingShows' && 1,
    }
  })

export default addShowToFireDatabase
