import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { SeasonEpisodesFromDatabaseInterface, UserShowsInterface, UserWillAirEpisodesInterface } from "../UseUserShows"
import { organiseFutureEpisodesByMonth } from "Components/Pages/Calendar/CalendarHelpers"
import { combineMergeObjects } from "Utils"
import merge from "deepmerge"

const SESSION_STORAGE_KEY_SHOWS = "userShows"

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
        .showInfo(show.id)
        .once("value")
        .then((snapshot: { val: () => { lastUpdatedInDatabase: number } }) => {
          if (snapshot.val() !== null) {
            const info = snapshot.val()
            if (show.database === "watchingShows" && !show.finished) {
              console.log("roflan")
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
    console.log({ watchingShows })
    const willAirEpisodes: UserWillAirEpisodesInterface[] = organiseFutureEpisodesByMonth(watchingShows)

    sessionStorage.setItem(SESSION_STORAGE_KEY_SHOWS, JSON.stringify(mergedShows))

    console.log({ mergedShows })

    // updateUserEpisodesFromDatabase({ firebase, authUser, showsFullInfo: mergedShows })

    console.log("after updateUserEpisodes")

    return { showsFullInfo: mergedShows, willAirEpisodes }
  })
}

export default getShowsFullInfo
