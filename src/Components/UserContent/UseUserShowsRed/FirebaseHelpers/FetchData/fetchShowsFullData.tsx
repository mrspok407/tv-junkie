import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { ShowInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
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
        return { ...show, episodes: [] }
      }
      if (show.database === 'watchingShows' && !show.finished) {
        const episodes = await fetchEpisodesFullData({ uid, showKey: show.id, firebase })
        return { ...showInfo.val(), episodes, episodesFetched: true }
      }
      return { ...showInfo.val(), episodes: [] }
    }),
  )

export default fetchShowsFullData

// const mergedShows: UserShowsInterface[] = merge(userShows, showsData, {
//   arrayMerge: combineMergeObjects
// })
// const watchingShows = mergedShows.filter((show) => show.database === "watchingShows")
// const willAirEpisodes: UserWillAirEpisodesInterface[] = organiseFutureEpisodesByMonth(watchingShows)

// return { showsFullInfo: mergedShows, willAirEpisodes }
