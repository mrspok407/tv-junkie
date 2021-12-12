/* eslint-disable array-callback-return */
import { SeasonEpisodesFromDatabaseInterface, UserShowsInterface } from "../UseUserShows"
import { differenceInObjects } from "Utils"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"

interface getFullInfoForUpdatedShowArg {
  userShows: UserShowsInterface[]
  userShowsSS: UserShowsInterface[]
  firebase: FirebaseInterface
}

const getFullInfoForUpdatedShow = async ({
  userShows,
  userShowsSS,
  firebase
}: getFullInfoForUpdatedShowArg): Promise<{
  userShowsCopy: UserShowsInterface[]
}> => {
  const userShowsCopy = [...userShows]

  const changedShow: any = userShowsCopy.find((show: any, index: any) => {
    if (
      (differenceInObjects(show, userShowsSS[index]).database ||
        differenceInObjects(show, userShowsSS[index]).allEpisodesWatched !== undefined) &&
      userShowsSS[index].episodes.length === 0
    ) {
      return show
    }
  })

  if (changedShow) {
    await firebase
      .showFullData(changedShow.id)
      .once("value")
      .then((snapshot: { val: () => { info: {}; episodes: SeasonEpisodesFromDatabaseInterface[] } }) => {
        const index = userShowsCopy.findIndex((item) => item.id === changedShow.id)
        const mergedShow = {
          ...changedShow,
          ...snapshot.val().info,
          episodes: snapshot.val().episodes
        }
        userShowsCopy[index] = mergedShow
      })
  }

  return { userShowsCopy }
}

export default getFullInfoForUpdatedShow
