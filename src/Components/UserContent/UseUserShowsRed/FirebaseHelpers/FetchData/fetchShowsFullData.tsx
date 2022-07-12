import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { ShowInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { throwErrorNoData } from 'Components/Firebase/Errors'
import { fetchEpisodesFullData } from './fetchEpisodesFullData'

interface GetUserShowsFullInfoArg {
  userShows: ShowInfoFromUserDatabase[]
  firebase: FirebaseInterface
  authUserUid: string
}

const fetchShowsFullData = ({ userShows, firebase, authUserUid }: GetUserShowsFullInfoArg) =>
  Promise.all(
    userShows.map(async (show) => {
      const showInfo = await firebase.showInfoFireDatabase(show.id).once('value')
      console.log({ fetchShowsFullData: showInfo })
      if (showInfo.val() === null) {
        console.log('throwErrorNoData')
        throwErrorNoData()
      }
      if (show.database === 'watchingShows' && !show.finished) {
        const episodes = await fetchEpisodesFullData({ authUserUid, showKey: show.id, firebase })
        return { ...showInfo.val()!, ...show, episodes, episodesFetched: true }
      }
      return { ...showInfo.val()!, ...show, episodes: [], episodesFetched: false }
    }),
  )

export default fetchShowsFullData
