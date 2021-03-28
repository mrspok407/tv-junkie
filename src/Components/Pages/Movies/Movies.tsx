import React, { useContext, useEffect, useState, useRef, useLayoutEffect, useCallback } from "react"
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
import "./Movies.scss"
const { CancelToken } = require("axios")

let cancelRequest: any
const MESSAGES_TO_LOAD = 50

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

  const lastMessageRef = useRef<HTMLDivElement>(null)

  const [messagesContainer, setMessagesContainer] = useState<any>(null)

  const [scrollAtTheBottom, setScrollAtTheBottom] = useState(false)

  const [firstLoad, setFirstLoad] = useState(false)

  const [initialObserver, setInitialObserver] = useState(false)

  const [observedMessages, setObservedMessages] = useState<string[]>([])

  const [unreadMessages, setUnreadMessages] = useState()

  const messagesContainerRef = useCallback((node) => {
    if (node !== null) {
      setMessagesContainer(node)
    }
  }, [])

  useLayoutEffect(() => {
    if (messages.length === 0 || firstLoad) return
    const messagesContainer: any = document.querySelector(".messages-container")
    const firstUnreadMessage = messages.find((msg: any) => msg.read === false)
    const lastMessage = messages[messages.length - 1]
    const lastMessageRef: any = document.querySelector(`.message-${lastMessage?.key}`)

    console.log({ firstUnreadMessage })
    console.log({ scrollAtTheBottom })

    if (firstUnreadMessage) {
      const firstUnreadMessageRef: any = document.querySelector(`.message-${firstUnreadMessage?.key}`)
      const contRect = messagesContainer?.getBoundingClientRect().top + document.documentElement.scrollTop
      const rect = firstUnreadMessageRef?.getBoundingClientRect().top + document.documentElement.scrollTop

      const vertPosRelativeToParent = rect - contRect

      messagesContainer.scroll(0, vertPosRelativeToParent)
      // setScrollAtTheBottom(false)
      setFirstLoad(true)
    } else {
      lastMessageRef?.scrollIntoView({ block: "nearest", inline: "start" })
      setScrollAtTheBottom(true)
      setFirstLoad(true)
    }
  }, [messages, firstLoad, scrollAtTheBottom])

  useEffect(() => {
    console.log("rerender")
  })

  const observerCallback = (entries: any) => {
    entries.forEach((entry: any) => {
      console.log({ targetNumber: entry.target.dataset.number, isIntersecting: entry.isIntersecting })
      if (entry.isIntersecting) {
        const messageKey = entry.target.dataset.key
        const messageRef: any = document.querySelector(`.message-${messageKey}`)
        firebase
          .user(authUser?.uid)
          .child(`content/messages/${messageKey}`)
          .update(
            {
              read: true
            },
            () => {
              observer.unobserve(messageRef)

              firebase
                .user(authUser?.uid)
                .child("content/unreadMessages")
                .once("value", (snapshot: any) => {
                  if (snapshot.val() === null || snapshot.val() <= 0) return
                  firebase
                    .user(authUser?.uid)
                    .child("content/unreadMessages")
                    .set(snapshot.val() - 1)
                })
            }
          )
      }
      // Each entry describes an intersection change for one observed
      // target element:
      //   entry.boundingClientRect
      //   entry.intersectionRatio
      //   entry.intersectionRect
      //   entry.isIntersecting
      //   entry.rootBounds
      //   entry.target
      //   entry.time
    })
  }

  let observerOptions = {
    root: messagesContainer,
    rootMargin: "0px",
    threshold: 1.0
  }

  const observer: any = new IntersectionObserver(observerCallback, observerOptions)

  useEffect(() => {
    if (messages.length === 0) return
    if (!initialObserver) {
      const unreadMessages = messages.filter((msg: any) => msg.read === false)
      unreadMessages.forEach(({ key }: any) => {
        const $message = document.querySelector(`.message-${key}`)
        observer.observe($message)
      })
      const observedMessages = unreadMessages.reduce((acc: any, message: any) => {
        acc.push(message.key)
        return acc
      }, [])
      setObservedMessages(observedMessages)
      setInitialObserver(true)
    } else {
      // if (!scrollAtTheBottom) {
      const lastMessage = messages[messages.length - 1]
      console.log({ lastMessage })
      if (observedMessages.includes(lastMessage.key)) return
      console.log("new observer")

      const lastMessageRef: any = document.querySelector(`.message-${lastMessage?.key}`)
      observer.observe(lastMessageRef)
      setObservedMessages([...observedMessages, lastMessage.key])
      // }
    }
  }, [messages, initialObserver])

  // if (lastMessageRef.current !== null) {
  //   console.log(lastMessageRef.current)

  //   observer.observe(lastMessageRef.current)
  // }

  useLayoutEffect(() => {
    messagesContainer?.addEventListener("scroll", handleScroll)
  }, [messagesContainer]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = () => {
    const height = messagesContainer.getBoundingClientRect().height
    const scrollHeight = messagesContainer.scrollHeight
    const scrollTop = messagesContainer.scrollTop

    if (scrollHeight === scrollTop + height) {
      console.log("scroll bottom")
      setScrollAtTheBottom(true)
    } else {
      console.log("scroll not bottom")
      setScrollAtTheBottom(false)
    }
  }

  useLayoutEffect(() => {
    console.log({ scrollAtTheBottom })
    if (messages.length === 0 || !scrollAtTheBottom) return
    const lastMessage = messages[messages.length - 1]
    const lastMessageRef: any = document.querySelector(`.message-${lastMessage?.key}`)
    lastMessageRef?.scrollIntoView({ block: "nearest", inline: "start" })
  }, [messages, scrollAtTheBottom])

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
    console.log("effect")
    // firebase.user(authUser?.uid).child("content/messages/status").onDisconnect().update({ online: false })

    firebase
      .user(authUser?.uid)
      .child("content/unreadMessages")
      .on("value", (snapshot: any) => {
        setUnreadMessages(snapshot.val())
      })

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

        console.log({ messagesData })
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
      // firebase.user(authUser?.uid).child("content/messages/status").update({ online: false })
      firebase.user(authUser?.uid).child("content/messages").off()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addNewMessage = () => {
    const messagesRef = firebase.user(authUser?.uid).child("content/messages")
    const newMessageRef = messagesRef.push()
    const randomNumber = Math.floor(Math.random() * Math.floor(201))
    newMessageRef.set({
      timeStamp: firebase.timeStamp(),
      message: "some text",
      number: randomNumber,
      read: false
    })

    firebase
      .user(authUser?.uid)
      .child("content/unreadMessages")
      .once("value", (snapshot: any) => {
        if (snapshot.val() === null) {
          firebase.user(authUser?.uid).child("content/unreadMessages").set(1)
        } else {
          firebase
            .user(authUser?.uid)
            .child("content/unreadMessages")
            .set(snapshot.val() + 1)
        }
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
      <button style={{ width: "300px" }} className="button" onClick={() => loadNewMessages()}>
        Load new shows
      </button>
      <button style={{ width: "300px" }} className="button" onClick={() => addNewMessage()}>
        Add new message
      </button>
      <div style={{ color: "#fff" }}>{unreadMessages}</div>
      <div className="messages-container" ref={messagesContainerRef}>
        {messages.map((message: any) => (
          <div
            key={message.key}
            ref={messages[messages.length - 1].key === message.key ? lastMessageRef : undefined}
            // ref={messages[messages.length - 1].key === message.key ? testRef : undefined}
            className={`message message-${message.key}`}
            data-key={message.key}
            data-number={message.number}
          >
            <div>
              {message.message} {message.number}
            </div>{" "}
            <button onClick={() => changeMessage(message.key)}>Change number</button>{" "}
            <button onClick={() => deleteMessage(message.key)}>Delete</button>
          </div>
        ))}
        {/* <div ref={testRef}></div> */}
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
