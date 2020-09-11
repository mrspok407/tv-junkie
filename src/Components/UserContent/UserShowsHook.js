import { useState, useEffect } from "react"

const useUserShows = firebase => {
  const [userShows, setUserShows] = useState([])
  const [loadingShows, setLoadingShows] = useState(true)

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
        firebase.userAllShows(authUser.uid).on("value", snapshot => {
          if (snapshot.val() === null) {
            setLoadingShows(false)
            return
          }

          const shows = Object.values(snapshot.val()).map(show => {
            return show
          })

          // console.log("updated userContent")

          // setUserShows(shows)
          // setLoadingShows(false)

          let mergedShows = []

          shows.forEach((show, index, array) => {
            firebase.showInfo(show.status, show.id).on("value", snapshot => {
              mergedShows = [...mergedShows, { ...show, ...snapshot.val() }]

              if (array.length === index + 1) {
                console.log("updated userContent")

                setUserShows(mergedShows)
                setLoadingShows(false)

                // this.setState({
                //   userShows: mergedShows,
                //   loadingShows: false
                // })
              }
            })
          })
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
