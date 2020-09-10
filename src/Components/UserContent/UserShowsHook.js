import { useState, useEffect } from "react"

const useUserShows = firebase => {
  const [userShows, setUserShows] = useState([])
  const [loadingShows, setLoadingShows] = useState(false)

  useEffect(() => {
    console.log("userShowsHook mounted")
    authUserListener()
    return () => {
      authUserListener()
    }
  }, [])

  const authUserListener = () => {
    firebase.onAuthUserListener(
      authUser => {
        console.log(authUser)
        firebase.userAllShows(authUser.uid).on("value", snapshot => {
          if (snapshot.val() === null) {
            setLoadingShows(false)
            return
          }

          const shows = Object.values(snapshot.val()).map(show => {
            return show
          })

          console.log("updated userContent")

          setUserShows(shows)
          setLoadingShows(false)
        })
      },
      () => {
        console.log("user is not logged in")
      }
    )
  }

  return {
    userShows,
    loadingShows
  }
}

export default useUserShows
