import React from "react"
import { withFirebase } from "Components/Firebase"
import { compose } from "recompose"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import { toggleWatchingShowsDatabase, deleteShowFromSubDatabase } from "./FirebaseHelpers"

const withUserContent = Component => {
  class WithUserContent extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        watchingShows: [],
        droppedShows: [],
        willWatchShows: [],
        watchLaterMovies: [],
        addWatchingShow: this.addWatchingShow,
        removeWatchingShow: this.removeWatchingShow,
        addShowToSubDatabase: this.addShowToSubDatabase,
        toggleWatchLaterMovie: this.toggleWatchLaterMovie,
        subDatabases: ["droppedShows", "willWatchShows"]
      }

      this.firebase = this.props.firebase
      this.userUid = this.props.authUser && this.props.authUser.uid
    }

    componentDidMount() {
      this._isMounted = true
      this.getContent()
    }

    componentDidUpdate() {
      // console.log(this.state.watchingShows)
    }

    addWatchingShow = (id, contentArr) => {
      const showIsWatching = this.state.watchingShows.find(show => show.id === id)
      const showToAdd = contentArr && contentArr.find(item => item.id === id)
      const notWatchingShows = this.state.subDatabases

      let mergedDatabases = []

      notWatchingShows.forEach(item => {
        const db = this.state[item]

        mergedDatabases.push(...db)
      })

      const showInSubDatabases = mergedDatabases.find(item => item.id === id)
      const keyShowInSubDb = showInSubDatabases ? showInSubDatabases.key : null

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
      const showIsWatching = this.state.watchingShows.find(show => show.id === id)

      if (showIsWatching) {
        const key = showIsWatching.key
        const userWatchingShow = false
        toggleWatchingShowsDatabase(this.firebase, this.userUid, key, userWatchingShow)
      }
    }

    addShowToSubDatabase = (id, contentArr, database) => {
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

    // addDroppedShow = (id, contentArr) => {
    //   const userUid = this.props.authUser.uid
    //   const contentExists = this.state.watchingShows.some(show => show.id === id)
    //   const allreadyDropped = this.state.droppedShows.some(show => show.id === id)
    //   const item = contentArr && contentArr.find(item => item.id === id)

    //   if (allreadyDropped) return
    //   if (contentExists) {
    //     toggleWatchingShowsDatabase(this.firebase, id, userUid, false)
    //   }

    //   const tvShow = this.state.willWatchShows.find(item => item.id === id)
    //   const key = tvShow ? tvShow.key : null

    //   deleteShowFromSubDatabase(this.firebase, userUid, ["willWatchShows"], key).then(() => {
    //     const newTvShowRef = this.firebase.droppedShows(userUid).push()
    //     const key = newTvShowRef.key

    //     newTvShowRef.set({ ...item, key })
    //   })
    // }

    // addWillWatchShow = (id, contentArr) => {
    //   const userUid = this.props.authUser.uid
    //   const contentExists = this.state.watchingShows.some(show => show.id === id)
    //   const allreadyWillBeWatching = this.state.willWatchShows.some(show => show.id === id)
    //   const item = contentArr && contentArr.find(item => item.id === id)

    //   if (allreadyWillBeWatching) return
    //   if (contentExists) {
    //     toggleWatchingShowsDatabase(this.firebase, id, userUid, false)
    //   }

    //   const tvShow = this.state.droppedShows.find(item => item.id === id)
    //   const key = tvShow ? tvShow.key : null

    //   deleteShowFromSubDatabase(this.firebase, userUid, ["droppedShows"], key).then(() => {
    //     const newTvShowRef = this.firebase.willWatchShows(userUid).push()
    //     const key = newTvShowRef.key

    //     newTvShowRef.set({ ...item, key })
    //   })
    // }

    getContent = () => {
      if (this.props.authUser === null) return

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
