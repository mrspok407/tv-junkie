import { useState, useEffect } from "react"
import { combineMergeObjects } from "Utils"
import merge from "deepmerge"

const SESSION_STORAGE_KEY_SHOWS = "userShows"

const useUserShows = firebase => {
  const [userShows, setUserShows] = useState([])
  // const [showsFromDatabase, setShowsFromDatabase] = useState([])
  const [loadingShows, setLoadingShows] = useState(true)

  useEffect(() => {
    console.log("userShowsHook mounted")
    authUserListener()
    return () => {
      console.log("test222")
      authUserListener()
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY_SHOWS, JSON.stringify(userShows))
  }, [userShows])

  const authUserListener = () => {
    firebase.onAuthUserListener(
      authUser => {
        firebase.userAllShows(authUser.uid).on("value", snapshot => {
          if (snapshot.val() === null) {
            setLoadingShows(false)
            return
          }

          const userShowsSessionStorage = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS))

          console.log(userShowsSessionStorage)
          console.log(snapshot.val())

          const shows = Object.values(snapshot.val()).map(show => {
            return show
          })

          Promise.all(
            Object.values(snapshot.val()).map(show => {
              return firebase
                .showInfo(show.status, show.id)
                .once("value")
                .then(snapshot => {
                  return {
                    ...show,
                    ...snapshot.val()
                  }
                })
            })
          ).then(showsDatabase => {
            const mergedShows = merge(shows, showsDatabase, {
              arrayMerge: combineMergeObjects
            })

            console.log("updated userContent")
            setUserShows(mergedShows)
            setLoadingShows(false)
          })
        })

        // firebase.userAllShows(authUser.uid).once("value", snapshot => {
        //   console.log("test")
        //   Promise.all(
        //     Object.values(snapshot.val()).map(show => {
        //       return firebase
        //         .showInfo(show.status, show.id)
        //         .once("value")
        //         .then(snapshot => {
        //           return {
        //             ...show,
        //             ...snapshot.val()
        //           }
        //         })
        //     })
        //   ).then(showsData => {
        //     firebase.userAllShows(authUser.uid).on("child_changed", snapshot => {
        //       const show = showsData.find(show => show.id === snapshot.val().id)
        //       const showIndex = showsData.findIndex(show => show.id === snapshot.val().id)
        //       const initialData = [...showsData].filter(show => show.id !== snapshot.val().id)

        //       console.log(showsData)

        //       console.log(initialData)

        //       if (show) {
        //         console.log(`changing child ${snapshot.val()}`)

        //         const mergedShow = { ...show, database: snapshot.val().database }

        //         initialData.splice(showIndex, 0, mergedShow)

        //         console.log(initialData)
        //         setUserShows(initialData)
        //       } else {
        //         console.log(`adding child`)
        //         console.log(snapshot.val())

        //         firebase.showInfo(snapshot.val().status, snapshot.val().id).once("value", showDatabase => {
        //           const mergedShow = { ...snapshot.val(), ...showDatabase }

        //           console.log(mergedShow)

        //           setUserShows([...initialData, mergedShow])
        //         })
        //       }
        //     })

        //     console.log(showsData)

        //     setUserShows(showsData)
        //     setLoadingShows(false)
        //   })
        // })
      },
      () => {
        console.log("user is not logged in")
      }
    )
  }

  // const mergedHandler = () => {
  //   let mergedShows = []

  //   showsTemp.forEach((show, index, array) => {
  //     // firebase.showInfo(show.status, show.id).on("value", snapshot => {
  //     //   mergedShows = [...mergedShows, { ...show, ...snapshot.val() }]

  //     //   if (array.length === index + 1) {
  //     //     console.log("updated userContent")

  //     //     setUserShows(mergedShows)
  //     //     setLoadingShows(false)
  //     //   }
  //     // })
  //   })
  // }

  return {
    userShows,
    loadingShows
  }
}

export default useUserShows
