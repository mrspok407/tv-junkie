import {
  SeasonEpisodesFromDatabaseInterface,
  UserShowsInterface,
  UserWillAirEpisodesInterface
} from "../UseUserShows"
import { organiseFutureEpisodesByMonth } from "Components/Pages/Calendar/CalendarHelpers"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"

interface SpliceNewShowFromDatabaseArg {
  userShow: UserShowsInterface
  index: number
  userShowsSS: UserShowsInterface[]
  firebase: FirebaseInterface
}

const spliceNewShowFromDatabase = ({
  userShow,
  index,
  userShowsSS,
  firebase
}: SpliceNewShowFromDatabaseArg): Promise<{
  showsFullInfo: UserShowsInterface[]
  willAirEpisodes: UserWillAirEpisodesInterface[]
}> => {
  return firebase
    .showInDatabase(userShow.id)
    .once("value")
    .then((snapshot: { val: () => { info: {}; episodes: SeasonEpisodesFromDatabaseInterface[] } }) => {
      const updatedShows = [...userShowsSS]
      const mergedShow = {
        ...userShow,
        ...snapshot.val().info,
        episodes: snapshot.val().episodes
      }

      console.log("splice")

      updatedShows.splice(index, 0, mergedShow)

      const watchingShows = updatedShows.filter((show) => show.database === "watchingShows")
      const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

      return { showsFullInfo: updatedShows, willAirEpisodes }
    })
}

export default spliceNewShowFromDatabase
