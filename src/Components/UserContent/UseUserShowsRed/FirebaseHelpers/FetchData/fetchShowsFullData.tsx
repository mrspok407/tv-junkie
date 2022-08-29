import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { ShowInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { fetchContentDetailsTMDB } from 'Components/Pages/Details/Hooks/UseGetDataTMDB'
import { fetchEpisodesFullData } from './fetchEpisodesFullData'
import postShowFireDatabase from '../PostData/postShowFireDatabase'
import { updateIsEpisodesWatched } from '../../Utils'
import { EpisodesStoreState } from '../../@Types'

interface GetUserShowsFullInfoArg {
  userShows: ShowInfoFromUserDatabase[]
  firebase: FirebaseInterface
  authUserUid: string
}

const fetchShowsFullData = ({ userShows, firebase, authUserUid }: GetUserShowsFullInfoArg) =>
  Promise.all(
    userShows.map(async (show) => {
      // if (show.id !== 46260) {
      //   return {}
      // }
      const showInfoFireSnapshot = await firebase.showInfoFireDatabase(show.id).once('value')
      let showInfo = showInfoFireSnapshot.val()!

      if (showInfoFireSnapshot.val() === null) {
        const showDetailsTMDB = await fetchContentDetailsTMDB({ mediaType: 'show', id: show.id })
        const showData = await postShowFireDatabase({ showDetailsTMDB, firebase })
        showInfo = showData!.info
      }

      if (show.database === 'watchingShows' && !show.allEpisodesWatched) {
        const episodesRawData = await fetchEpisodesFullData({ authUserUid, showKey: show.id, firebase })
        const [episodesFinalData, allReleasedEpisodesWatched] =
          updateIsEpisodesWatched<EpisodesStoreState>(episodesRawData)
        return { ...showInfo, ...show, allReleasedEpisodesWatched, episodes: episodesFinalData, episodesFetched: true }
      }
      return { ...showInfo, ...show, allReleasedEpisodesWatched: null, episodes: [], episodesFetched: false }
    }),
  )

export default fetchShowsFullData
