import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { ShowInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { fetchContentDetailesTMDB } from 'Components/Pages/Detailes/Hooks/UseGetDataTMDB'
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
      const showInfoSnapshot = await firebase.showInfoFireDatabase(show.id).once('value')
      let showInfo = showInfoSnapshot.val()!

      if (showInfoSnapshot.val() === null) {
        const showDetailesTMDB = await fetchContentDetailesTMDB({ mediaType: 'show', id: show.id })
        const showData = await postShowFireDatabase({ showDetailesTMDB, database: show.database, firebase })
        showInfo = showData!.info
      }

      if (show.database === 'watchingShows' && !show.finished) {
        const episodes = await fetchEpisodesFullData({ authUserUid, showKey: show.id, firebase })
        return { ...showInfo, ...show, episodes, episodesFetched: true }
      }
      return { ...showInfo, ...show, episodes: [], episodesFetched: false }
    }),
  )

export default fetchShowsFullData
