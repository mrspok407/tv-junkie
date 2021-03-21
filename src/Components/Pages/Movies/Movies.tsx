import React, { useContext, useEffect, useState } from "react"
import axios from "axios"
import { Helmet } from "react-helmet"
import Header from "Components/UI/Header/Header"
import MoviesContent from "./MoviesContent"
import ScrollToTop from "Utils/ScrollToTopBar"
import Footer from "Components/UI/Footer/Footer"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"
import useGoogleRedirect from "Components/UserAuth/SignIn/UseGoogleRedirect"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"
const { CancelToken } = require("axios")

let cancelRequest: any

const Movies: React.FC = () => {
  const [moviesData, setMoviesData] = useState<ContentDetailes[]>([])
  const [loadingIds, setLoadingIds] = useState<number[]>([])
  const [openLinksMoviesId, setOpenLinksMoviesId] = useState<number[]>([])
  const [error, setError] = useState<number[]>([])

  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)

  useGoogleRedirect()

  const [shows, setShows] = useState<any>([])
  const [lastTS, setLastTS] = useState<number>()

  const loadNewShows = () => {
    const refShows = firebase.userAllShows(authUser?.uid).orderByChild("timeStamp")

    refShows
      .endBefore(lastTS)
      .limitToLast(2)
      .once("value", (snapshot: any) => {
        if (snapshot.val() === null) return
        console.log(snapshot.val())
        const showsData: any = Object.values(snapshot.val()).map((show) => show)
        setLastTS(showsData[0].timeStamp)
        setShows((prevState: any) => {
          return [...showsData, ...prevState]
        })

        console.log({ showsDataOnceNEW: showsData })

        refShows
          .endBefore(lastTS)
          .limitToLast(2)
          .on("child_changed", (snapshot: any) => {
            console.log({ child_changedNEW: snapshot.val() })
            const changedShowData = snapshot.val()
            setShows((prevState: any) => {
              const changedShowIndex = prevState.findIndex((show: any) => show.key === changedShowData.key)
              prevState[changedShowIndex] = changedShowData

              return [...prevState]
            })
          })
      })
  }

  useEffect(() => {
    firebase
      .userAllShows(authUser?.uid)
      .orderByChild("timeStamp")
      .limitToLast(1)
      .once("value", (snapshot: any) => {
        const lastShow: any = Object.values(snapshot.val())[0]

        const refShows = firebase.userAllShows(authUser?.uid).orderByChild("timeStamp")

        refShows
          .endBefore(lastShow.timeStamp)
          .limitToLast(2)
          .once("value", (snapshot: any) => {
            const showsData: any = Object.values(snapshot.val()).map((show) => show)
            setLastTS(showsData[0].timeStamp)
            setShows((prevState: any) => {
              return [...showsData, ...prevState]
            })

            console.log({ showsDataOnce: showsData })

            refShows
              .endBefore(lastShow.timeStamp)
              .limitToLast(2)
              .on("child_changed", (snapshot: any) => {
                console.log({ child_changed: snapshot.val() })
                const changedShowData = snapshot.val()
                setShows((prevState: any) => {
                  const changedShowIndex = prevState.findIndex((show: any) => show.key === changedShowData.key)
                  prevState[changedShowIndex] = changedShowData

                  return [...prevState]
                })
              })
          })

        // refShows.startAt(lastShow.timeStamp).on("value", (snapshot: any) => {
        //   const showsData = Object.values(snapshot.val()).map((show) => show)
        //   setShows((prevState: any) => {
        //     return [...prevState, ...showsData]
        //   })
        //   console.log({ latestShows: snapshot.val() })
        // })

        refShows.startAt(lastShow.timeStamp).on("child_added", (snapshot: any) => {
          const addedShow = snapshot.val()
          setShows((prevState: any) => {
            return [...prevState, addedShow]
          })
          console.log({ child_added: snapshot.val() })
        })

        refShows.startAt(lastShow.timeStamp).on("child_changed", (snapshot: any) => {
          console.log("child_changed")
          const changedShowData = snapshot.val()
          setShows((prevState: any) => {
            const changedShowIndex = prevState.findIndex((show: any) => show.key === changedShowData.key)
            prevState[changedShowIndex] = changedShowData

            return [...prevState]
          })
        })
      })
  }, [])

  console.log({ showsState: shows })

  useEffect(() => {
    return () => {
      if (cancelRequest !== undefined) cancelRequest()
    }
  }, [])

  const getMovieLinks = ({ id }: { id: number }) => {
    if (openLinksMoviesId.includes(id)) return

    setLoadingIds((prevState) => [...prevState, id])
    setOpenLinksMoviesId((prevState) => [...prevState, id])

    axios
      .get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US&append_to_response=similar_movies,external_ids`,
        {
          cancelToken: new CancelToken(function executor(c: any) {
            cancelRequest = c
          })
        }
      )
      .then(({ data: { external_ids } }) => {
        const imdbId = external_ids.imdb_id
        return axios.get(`https://yts.mx/api/v2/list_movies.json?query_term=${imdbId}`, {
          cancelToken: new CancelToken(function executor(c: any) {
            cancelRequest = c
          })
        })
      })
      .then((res) => {
        const movie = res.data.data.movies[0]
        movie.id = id

        setMoviesData((prevState) => [...prevState, movie])
        setLoadingIds((prevState) => [...prevState.filter((item: number) => item !== id)])
      })
      .catch((error) => {
        if (axios.isCancel(error)) return
        setError((prevState) => [...prevState, id])
      })
  }

  return (
    <>
      <Helmet>
        <title>All your movies | TV Junkie</title>
      </Helmet>
      <Header />
      <button className="button" onClick={() => loadNewShows()}>
        Load new shows
      </button>
      <MoviesContent
        moviesData={moviesData}
        getMovieLinks={getMovieLinks}
        loadingIds={loadingIds}
        openLinksMoviesId={openLinksMoviesId}
        error={error}
      />
      <Footer />
      <ScrollToTop />
    </>
  )
}

export default Movies
