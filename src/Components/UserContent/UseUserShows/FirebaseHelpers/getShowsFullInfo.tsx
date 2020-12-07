import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import {
  SeasonEpisodesFromDatabaseInterface,
  UserShowsInterface,
  UserWillAirEpisodesInterface
} from "../UseUserShows"
import { organiseFutureEpisodesByMonth } from "Components/Pages/Calendar/CalendarHelpers"
import { combineMergeObjects } from "Utils"
import updateUserEpisodesFromDatabase from "Components/UserContent/UseUserShows/FirebaseHelpers/updateUserEpisodesFromDatabase"
import merge from "deepmerge"

interface GetUserShowsFullInfoArg {
  userShows: UserShowsInterface[]
  firebase: FirebaseInterface
  authUser: AuthUserInterface
}

const getShowsFullInfo = ({ userShows, firebase, authUser }: GetUserShowsFullInfoArg) => {
  console.log("getShowsFullInfo")
  return Promise.all(
    userShows.map((show) => {
      return firebase
        .showInDatabase(show.id)
        .once("value")
        .then((snapshot: { val: () => { info: {}; episodes: SeasonEpisodesFromDatabaseInterface } }) => {
          if (snapshot.val() !== null) {
            return {
              ...show,
              ...snapshot.val().info,
              episodes: snapshot.val().episodes || []
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

    console.log({ mergedShows })

    await updateUserEpisodesFromDatabase({ firebase, authUser, showsFullInfo: mergedShows })

    return { showsFullInfo: mergedShows, willAirEpisodes }
  })
}

export default getShowsFullInfo
