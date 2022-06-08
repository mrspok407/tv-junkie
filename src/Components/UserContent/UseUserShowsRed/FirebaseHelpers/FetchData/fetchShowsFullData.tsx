import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { ShowInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { throwErrorNoData } from 'Components/Firebase/Errors'
import { fetchEpisodesFullData } from '.'

interface GetUserShowsFullInfoArg {
  userShows: ShowInfoFromUserDatabase[]
  firebase: FirebaseInterface
  uid: string
}

const fetchShowsFullData = ({ userShows, firebase, uid }: GetUserShowsFullInfoArg) =>
  Promise.all(
    userShows.map(async (show) => {
      const showInfo = await firebase.showInfoFireDatabase(show.id).once('value')
      if (showInfo.val() === null) {
        throwErrorNoData()
      }
      if (show.database === 'watchingShows' && !show.finished) {
        const episodes = await fetchEpisodesFullData({ uid, showKey: show.id, firebase })
        return { ...showInfo.val()!, ...show, episodes, episodesFetched: true }
      }
      return { ...showInfo.val()!, ...show, episodes: [], episodesFetched: false }
    }),
  )

export default fetchShowsFullData
