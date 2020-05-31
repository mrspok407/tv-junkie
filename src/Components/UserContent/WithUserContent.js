import React from "react"
import { withFirebase } from "Components/Firebase"
import { compose } from "recompose"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import { toggleWatchingShowsDatabase, deleteShowFromSubDatabase } from "./FirebaseHelpers"

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = "watchingShowsLocalS"
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = "watchLaterMoviesLocalS"

const withUserContent = Component => {
  class WithUserContent extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        watchingShows: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)) || [],
        droppedShows: [],
        willWatchShows: [],
        watchLaterMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)) || [],
        addWatchingShow: this.addWatchingShow,
        removeWatchingShow: this.removeWatchingShow,
        addShowToSubDatabase: this.addShowToSubDatabase,
        toggleWatchLaterMovie: this.toggleWatchLaterMovie,
        subDatabases: ["droppedShows", "willWatchShows"]
      }

      this.firebase = this.props.firebase
      this.userUid = this.props.authUser && this.props.authUser.uid
      this.authUser = this.props.authUser
    }

    componentDidMount() {
      this._isMounted = true
      this.getContent()
    }

    componentDidUpdate(prevProps) {
      if (this.props.authUser && this.props.authUser !== prevProps.authUser) {
        this.authUser = this.props.authUser
        this.userUid = this.props.authUser.uid

        this.getContent()
      }
    }

    addWatchingShow = (id, contentArr) => {
      const showToAdd = contentArr && contentArr.find(item => item.id === id)

      if (this.authUser === null) {
        showToAdd.userWatching = true
        this.setState(
          {
            watchingShows: [...this.state.watchingShows, showToAdd]
          },
          () => {
            localStorage.setItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS, JSON.stringify(this.state.watchingShows))
          }
        )
        return
      }

      const showIsWatching = this.state.watchingShows.find(show => show.id === id)
      const notWatchingShows = this.state.subDatabases

      let mergedDatabases = []

      notWatchingShows.forEach(item => {
        const db = this.state[item]

        mergedDatabases.push(...db)
      })

      const showInSubDatabases = mergedDatabases.find(item => item.id === id)
      const keyShowInSubDb = showInSubDatabases ? showInSubDatabases.key : null

      console.log(this.userUid)

      deleteShowFromSubDatabase(this.firebase, this.userUid, this.state.subDatabases, keyShowInSubDb).then(
        () => {
          if (!showIsWatching) {
            const newShowRef = this.firebase.watchingShows(this.userUid).push()
            const key = newShowRef.key

            const showInfo = showToAdd || showInSubDatabases

            newShowRef.set({ ...showInfo, key, userWatching: true })
          } else {
            const key = showIsWatching.key
            const userWatchingShow = true
            toggleWatchingShowsDatabase(this.firebase, this.userUid, key, userWatchingShow)
          }
        }
      )
    }

    removeWatchingShow = id => {
      if (this.authUser === null) {
        this.setState(
          {
            watchingShows: [...this.state.watchingShows.filter(item => item.id !== id)]
          },
          () => {
            localStorage.setItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS, JSON.stringify(this.state.watchingShows))
          }
        )
        return
      }

      const showIsWatching = this.state.watchingShows.find(show => show.id === id)

      if (showIsWatching) {
        const key = showIsWatching.key
        const userWatchingShow = false
        toggleWatchingShowsDatabase(this.firebase, this.userUid, key, userWatchingShow)
      }
    }

    addShowToSubDatabase = (id, contentArr, database) => {
      if (this.authUser === null) return

      const showIsWatching = this.state.watchingShows.find(show => show.id === id)
      const showInDatabase = this.state[database].some(show => show.id === id)
      const showToAdd = contentArr && contentArr.find(item => item.id === id)

      if (showInDatabase) return
      if (showIsWatching) {
        const key = showIsWatching.key
        const userWatchingShow = false
        toggleWatchingShowsDatabase(this.firebase, this.userUid, key, userWatchingShow)
      }

      const otherDatabases = this.state.subDatabases.filter(item => item !== database)
      let mergedDatabases = []

      otherDatabases.forEach(item => {
        const db = this.state[item]

        mergedDatabases.push(...db)
      })

      const showInSubDatabases = mergedDatabases.find(item => item.id === id)
      const keyShowInSubDb = showInSubDatabases ? showInSubDatabases.key : null

      deleteShowFromSubDatabase(this.firebase, this.userUid, otherDatabases, keyShowInSubDb).then(() => {
        const newShowRef = this.firebase[database](this.userUid).push()
        const key = newShowRef.key

        newShowRef.set({ ...showToAdd, key })
      })
    }

    toggleWatchLaterMovie = (id, contentArr) => {
      const movieExists = this.state.watchLaterMovies.find(show => show.id === id)
      const movieToAdd = contentArr && contentArr.find(item => item.id === id)

      if (this.authUser === null) {
        if (!movieExists) {
          this.setState(
            {
              watchLaterMovies: [...this.state.watchLaterMovies, movieToAdd]
            },
            () => {
              localStorage.setItem(
                LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES,
                JSON.stringify(this.state.watchLaterMovies)
              )
            }
          )
        } else {
          this.setState(
            {
              watchLaterMovies: [...this.state.watchLaterMovies.filter(item => item.id !== id)]
            },
            () => {
              localStorage.setItem(
                LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES,
                JSON.stringify(this.state.watchLaterMovies)
              )
            }
          )
        }
        return
      }

      if (!movieExists) {
        const newMovieRef = this.firebase.watchLaterMovies(this.userUid).push()
        const key = newMovieRef.key

        newMovieRef.set({ ...movieToAdd, key })
      } else {
        const key = movieExists.key

        this.firebase
          .watchLaterMovies(this.userUid)
          .child(key)
          .remove()
      }
    }

    getContent = () => {
      if (this.userUid === null) {
        this.setState({
          watchingShows: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)) || [],
          droppedShows: [],
          willWatchShows: [],
          watchLaterMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)) || []
        })
        return
      }

      this.firebase.userContent(this.userUid).on("value", snapshot => {
        const userContent = snapshot.val() || {}
        const { watchingShows, droppedShows, willWatchShows, watchLaterMovies } = userContent

        const watchingTvShowsList = watchingShows
          ? Object.keys(watchingShows).map(key => ({
              ...watchingShows[key],
              uid: key
            }))
          : []

        const droppedTvShowsList = droppedShows
          ? Object.keys(droppedShows).map(key => ({
              ...droppedShows[key],
              uid: key
            }))
          : []

        const willBeWatchingTvShowsList = willWatchShows
          ? Object.keys(willWatchShows).map(key => ({
              ...willWatchShows[key],
              uid: key
            }))
          : []

        const watchLaterMoviesList = watchLaterMovies
          ? Object.keys(watchLaterMovies).map(key => ({
              ...watchLaterMovies[key],
              uid: key
            }))
          : []

        if (this._isMounted) {
          this.setState({
            watchingShows: watchingTvShowsList,
            droppedShows: droppedTvShowsList,
            willWatchShows: willBeWatchingTvShowsList,
            watchLaterMovies: watchLaterMoviesList
          })
        }
      })
    }

    componentWillUnmount() {
      this._isMounted = false
      // this.props.firebase.userContent(this.props.authUser.uid).off()
    }

    render() {
      return <Component {...this.props} userContent={this.state} />
    }
  }
  return compose(withFirebase, WithAuthenticationConsumer)(WithUserContent)
}

export default withUserContent
