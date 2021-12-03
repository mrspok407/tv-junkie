import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { SeasonEpisodesFromDatabaseInterface, UserShowsInterface, UserWillAirEpisodesInterface } from "../UseUserShows"
import { organiseFutureEpisodesByMonth } from "Components/Pages/Calendar/CalendarHelpers"
import { combineMergeObjects } from "Utils"
import merge from "deepmerge"
import { SnapshotVal } from "Components/AppContext/@Types"

interface GetUserShowsFullInfoArg {
  userShows: UserShowsInterface[]
  firebase: FirebaseInterface
}

const fetchShowsFullData = ({ userShows, firebase }: GetUserShowsFullInfoArg) => {
  return Promise.all(
    userShows.map(async (show) => {
      const showInfo = await firebase.showInfo(show.id).once("value")
      if (showInfo.val() === null) {
        return { ...show, episodes: [] }
      }
      if (show.database === "watchingShows" && !show.finished) {
        const episodesData: SnapshotVal<SeasonEpisodesFromDatabaseInterface[]> = await firebase
          .showEpisodes(show.id)
          .once("value")
        return { ...showInfo.val(), episodes: episodesData.val(), episodesFetched: true }
      }
      return { ...showInfo.val(), episodes: [] }
    })
  )
}

export default fetchShowsFullData

// const mergedShows: UserShowsInterface[] = merge(userShows, showsData, {
//   arrayMerge: combineMergeObjects
// })
// const watchingShows = mergedShows.filter((show) => show.database === "watchingShows")
// const willAirEpisodes: UserWillAirEpisodesInterface[] = organiseFutureEpisodesByMonth(watchingShows)

// return { showsFullInfo: mergedShows, willAirEpisodes }
