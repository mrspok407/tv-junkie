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
const MESSAGES_TO_LOAD = 5

const Movies: React.FC = () => {
  const [moviesData, setMoviesData] = useState<ContentDetailes[]>([])
  const [loadingIds, setLoadingIds] = useState<number[]>([])
  const [openLinksMoviesId, setOpenLinksMoviesId] = useState<number[]>([])
  const [error, setError] = useState<number[]>([])

  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)

  useGoogleRedirect()

  const [messages, setMessages] = useState<any>([])
  const [lastTS, setLastTS] = useState<number>()
  const messagesRef = firebase.user(authUser?.uid).child("content/messages").orderByChild("timeStamp")

  const loadNewMessages = () => {
    messagesRef
      .endBefore(lastTS)
      .limitToLast(MESSAGES_TO_LOAD)
      .once("value", (snapshot: any) => {
        if (snapshot.val() === null) return
        let messagesData: any = []
        snapshot.forEach((message: any) => {
          messagesData.push({ ...message.val(), key: message.key })
        })

        setLastTS(messagesData[0].timeStamp)
        setMessages((prevState: any) => {
          console.log({ messages })
          console.log({ prevState })
          return [...messagesData, ...prevState]
        })

        console.log({ messagesDataOnceNEW: messagesData })

        const testFun = (snapshot: any) => {
          console.log({ child_changedNEW: snapshot.val() })
          const changedMessageData = { ...snapshot.val(), key: snapshot.key }
          setMessages((prevState: any) => {
            const changedMessageIndex = prevState.findIndex((message: any) => message.key === snapshot.key)
            const changedMessageInState = prevState[changedMessageIndex]

            prevState[changedMessageIndex] = changedMessageIndex !== -1 && {
              ...changedMessageData,
              timeStamp: changedMessageInState.timeStamp
            }
            return [...prevState]
          })
        }

        messagesRef.endBefore(lastTS).limitToLast(MESSAGES_TO_LOAD).on("child_changed", testFun)

        messagesRef
          .endBefore(lastTS)
          .limitToLast(MESSAGES_TO_LOAD)
          .on("child_removed", (snapshot: any) => {
            const removedMessage = { ...snapshot.val(), key: snapshot.key }
            setMessages((prevState: any) => {
              return [...prevState.filter((message: any) => message.key !== removedMessage.key)]
            })
          })
      })
  }

  useEffect(() => {
    // const messagesRef = firebase.user(authUser?.uid).child("content/messages").orderByChild("timeStamp")

    firebase.user(authUser?.uid).child("content/messages/status").update({ online: true })
    firebase.user(authUser?.uid).child("content/messages/status").onDisconnect().update({ online: false })

    messagesRef.limitToLast(MESSAGES_TO_LOAD).once("value", (snapshot: any) => {
      let lastMessageTS: any = 0
      let firstMessageTS: any = 0

      if (snapshot.val() !== null) {
        let messagesData: any = []
        snapshot.forEach((message: any) => {
          messagesData.push({ ...message.val(), key: message.key })
        })

        lastMessageTS = messagesData[messagesData.length - 1].timeStamp
        firstMessageTS = messagesData[0].timeStamp

        setLastTS(firstMessageTS)
        setMessages(messagesData)
      }

      messagesRef.startAfter(lastMessageTS).on("child_added", (snapshot: any) => {
        const addedMessage = { ...snapshot.val(), key: snapshot.key }
        console.log({ addedChild: addedMessage })
        setMessages((prevState: any) => {
          return [...prevState, addedMessage]
        })
      })

      messagesRef.startAt(firstMessageTS).on("child_changed", (snapshot: any) => {
        const changedMessageData = { ...snapshot.val(), key: snapshot.key }
        console.log({ chagnedChild: changedMessageData })
        setMessages((prevState: any) => {
          console.log({ prevState })
          const changedMessageIndex = prevState.findIndex((message: any) => message.key === snapshot.key)
          const changedMessageInState = prevState[changedMessageIndex]

          prevState[changedMessageIndex] = changedMessageIndex !== -1 && {
            ...changedMessageData,
            timeStamp: changedMessageInState.timeStamp
          }
          return [...prevState]
        })
      })

      messagesRef.startAt(firstMessageTS).on("child_removed", (snapshot: any) => {
        const removedMessage = { ...snapshot.val(), key: snapshot.key }
        setMessages((prevState: any) => {
          return [...prevState.filter((message: any) => message.key !== removedMessage.key)]
        })
      })
    })

    return () => {
      firebase.user(authUser?.uid).child("content/messages/status").update({ online: false })
      firebase.user(authUser?.uid).child("content/messages").off()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // console.log({ messages })
    // console.log("component rerendered")
  })

  const addNewMessage = () => {
    const messagesRef = firebase.user(authUser?.uid).child("content/messages")
    const newMessageRef = messagesRef.push()
    const randomNumber = Math.floor(Math.random() * Math.floor(201))
    newMessageRef.set({
      timeStamp: firebase.timeStamp(),
      message: "some text",
      number: randomNumber
    })
  }

  const changeMessage = (key: any) => {
    firebase
      .user(authUser?.uid)
      .child(`content/messages/${key}`)
      .update({
        number: Math.floor(Math.random() * Math.floor(201))
      })
  }

  const deleteMessage = (key: any) => {
    firebase.user(authUser?.uid).child(`content/messages/${key}`).set(null)
  }

  // console.log({ messagesState: messages })

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
      <button className="button" onClick={() => loadNewMessages()}>
        Load new shows
      </button>
      <button className="button" onClick={() => addNewMessage()}>
        Add new message
      </button>
      <div>
        {messages.map((message: any) => (
          <div
            key={message.key}
            style={{ color: "#fff", gridTemplateColumns: "repeat(3, 1fr)", alignItems: "center", display: "grid" }}
          >
            <div>
              {message.message} {message.number}
            </div>{" "}
            <button onClick={() => changeMessage(message.key)}>Change number</button>{" "}
            <button onClick={() => deleteMessage(message.key)}>Delete</button>
          </div>
        ))}
      </div>
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
