import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { ShowInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { fetchContentDetailsTMDB } from 'Components/Pages/Details/Hooks/UseGetDataTMDB'
import { fetchEpisodesFullData } from './fetchEpisodesFullData'
import postShowFireDatabase from '../PostData/postShowFireDatabase'

interface GetUserShowsFullInfoArg {
  userShows: ShowInfoFromUserDatabase[]
  firebase: FirebaseInterface
  authUserUid: string
}

const fetchShowsFullData = ({ userShows, firebase, authUserUid }: GetUserShowsFullInfoArg) =>
  Promise.all(
    userShows.map(async (show) => {
      const showInfoFireSnapshot = await firebase.showInfoFireDatabase(show.id).once('value')
      let showInfo = showInfoFireSnapshot.val()!

      if (showInfoFireSnapshot.val() === null) {
        const showDetailsTMDB = await fetchContentDetailsTMDB({ mediaType: 'show', id: show.id })
        const showData = await postShowFireDatabase({ showDetailsTMDB, firebase })
        showInfo = showData!.info
      }

      if (show.database === 'watchingShows' && !show.allEpisodesWatched) {
        const episodes = await fetchEpisodesFullData({ authUserUid, showKey: show.id, firebase })
        return { ...showInfo, ...show, episodes, episodesFetched: true }
      }
      return { ...showInfo, ...show, episodes: [], episodesFetched: false }
    }),
  )

export default fetchShowsFullData
