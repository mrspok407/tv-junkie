import React, { useState, useEffect, useContext } from "react"
import { FirebaseContext } from "Components/Firebase"
import { useHistory } from "react-router"
import * as ROUTES from "Utils/Constants/routes"
import { UserShowsInterface } from "Components/UserContent/UseUserShows/UseUserShows"
import { ShowInterface } from "Components/AppContext/AppContextHOC"
import { combineMergeObjects } from "Utils"
import merge from "deepmerge"

type Props = {
  userUid: string
}

const UserProfileContent: React.FC<Props> = ({ userUid }) => {
  const [content, setContent] = useState<UserShowsInterface>()

  const firebase = useContext(FirebaseContext)
  const history = useHistory()

  useEffect(() => {
    console.log({ userUid })

    firebase
      .user(userUid)
      .child("username")
      .once("value", (snapshot: any) => {
        console.log(snapshot.val())
        if (snapshot.val() === null) {
          history.push(ROUTES.PAGE_DOESNT_EXISTS)
          return
        }

        firebase.userAllShows(userUid).once("value", async (snapshot: { val: () => UserShowsInterface[] }) => {
          const userShows = Object.values(snapshot.val()).map((show) => show)
          console.log({ shows: userShows })

          const showsFromDatabase = await Promise.all(
            userShows.map((show) => {
              return firebase
                .showInfo(show.id)
                .once("value")
                .then((snapshot: { val: () => ShowInterface }) => {
                  if (snapshot.val() === null) return
                  const info = snapshot.val()
                  return { ...info }
                })
            })
          )

          const mergedShows: UserShowsInterface[] = merge(userShows, showsFromDatabase, {
            arrayMerge: combineMergeObjects
          })

          console.log({ showsFromDatabase })
          console.log({ mergedShows })
          // .then(async (showsDatabase) => {
          //   const mergedShows: UserShowsInterface[] = merge(userShows, showsDatabase, {
          //     arrayMerge: combineMergeObjects
          //   })
          // })
        })
      })
  }, [userUid])

  return <div className="content-results"></div>
}

export default UserProfileContent
