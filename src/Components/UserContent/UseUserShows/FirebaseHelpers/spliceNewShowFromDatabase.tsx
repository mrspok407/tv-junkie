import { SeasonEpisodesFromDatabaseInterface, UserShowsInterface, UserWillAirEpisodesInterface } from "../UseUserShows"
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
    .showFullData(userShow.id)
    .once("value")
    .then((snapshot: { val: () => { info: {}; episodes: SeasonEpisodesFromDatabaseInterface[] } }) => {
      if (snapshot.val() === null) {
        throw new Error(
          "There's no data in database, by this path. And if this function is called the data should be here.\n" +
            "Find out the reason why the data is missing at the point of calling this function."
        )
      }

      const updatedShows = [...userShowsSS]
      const mergedShow = {
        ...userShow,
        ...snapshot.val().info,
        episodes: snapshot.val().episodes
      }

      updatedShows.splice(index, 0, mergedShow)

      const watchingShows = updatedShows.filter((show) => show.database === "watchingShows")
      const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

      return { showsFullInfo: updatedShows, willAirEpisodes }
    })
}

export default spliceNewShowFromDatabase
