import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { SeasonEpisodesFromDatabaseInterface, UserShowsInterface, UserWillAirEpisodesInterface } from "../UseUserShows"
import { organiseFutureEpisodesByMonth } from "Components/Pages/Calendar/CalendarHelpers"
import { combineMergeObjects } from "Utils"
import merge from "deepmerge"

interface GetUserShowsFullInfoArg {
  userShows: UserShowsInterface[]
  firebase: FirebaseInterface
  authUser: AuthUserInterface
}

const getShowsFullInfo = ({ userShows, firebase }: GetUserShowsFullInfoArg) => {
  return Promise.all(
    userShows.map((show) => {
      return firebase
        .showInfo(show.id)
        .once("value")
        .then((snapshot: { val: () => { lastUpdatedInDatabase: number } }) => {
          if (snapshot.val() !== null) {
            const info = snapshot.val()
            if (show.database === "watchingShows" && !show.finished) {
              return firebase
                .showEpisodes(show.id)
                .once("value")
                .then((snapshot: { val: () => SeasonEpisodesFromDatabaseInterface[] }) => {
                  return { ...info, episodes: snapshot.val() }
                })
            } else {
              return { ...info, episodes: [] }
            }
          }
        })
    })
  ).then(async (showsDatabase) => {
    const mergedShows: UserShowsInterface[] = merge(userShows, showsDatabase, {
      arrayMerge: combineMergeObjects
    })
    const watchingShows: any = mergedShows.filter((show) => show && show.database === "watchingShows")
    const willAirEpisodes: UserWillAirEpisodesInterface[] = organiseFutureEpisodesByMonth(watchingShows)

    return { showsFullInfo: mergedShows, willAirEpisodes }
  })
}

export default getShowsFullInfo
