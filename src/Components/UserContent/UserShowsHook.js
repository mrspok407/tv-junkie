import { useState, useEffect } from "react"

const useUserShows = firebase => {
  const [userShows, setUserShows] = useState([])
  const [showsTemp, setShowsTemp] = useState([])
  const [loadingShows, setLoadingShows] = useState(true)

  useEffect(() => {
    console.log("userShowsHook mounted")
    authUserListener()
    // mergedHandler()
    return () => {
      authUserListener()
    }
  }, [])

  const authUserListener = () => {
    firebase.onAuthUserListener(
      authUser => {
        let shows = []

        firebase.userAllShows(authUser.uid).on("value", snapshot => {
          if (snapshot.val() === null) {
            setLoadingShows(false)
            return
          }

          shows = Object.values(snapshot.val()).map(show => {
            return show
          })

          // const shows = Object.values(snapshot.val()).map(show => {
          //   return show
          // })

          // console.log("updated userContent")

          // setUserShows(shows)
          // setLoadingShows(false)

          // setShowsTemp(shows)

          // let mergedShows = []
        })

        let mergedShows = []

        console.log(shows)

        shows.forEach((show, index, array) => {
          firebase.showInfo(show.status, show.id).on("value", snapshot => {
            mergedShows = [...mergedShows, { ...show, ...snapshot.val() }]

            if (array.length === index + 1) {
              console.log("updated userContent")

              setUserShows(mergedShows)
              setLoadingShows(false)
            }
          })
        })
      },
      () => {
        console.log("user is not logged in")
      }
    )
  }

  const mergedHandler = () => {
    let mergedShows = []

    console.log(showsTemp)

    showsTemp.forEach((show, index, array) => {
      firebase.showInfo(show.status, show.id).on("value", snapshot => {
        mergedShows = [...mergedShows, { ...show, ...snapshot.val() }]

        if (array.length === index + 1) {
          console.log("updated userContent")

          setUserShows(mergedShows)
          setLoadingShows(false)
        }
      })
    })
  }

  return {
    userShows,
    loadingShows
  }
}

export default useUserShows
