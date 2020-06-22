import React from "react"
import { withFirebase } from "Components/Firebase"
import { compose } from "recompose"
import axios from "axios"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import { toggleWatchingShowsDatabase, deleteShowFromSubDatabase } from "./FirebaseHelpers"

const withUserContent = (Component, passedComponent) => {
  class WithUserContent extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        watchingShows: [],
        droppedShows: [],
        willWatchShows: [],
        watchLaterMovies: [],
        subDatabases: ["watchingShows", "notWatchingShows", "droppedShows", "willWatchShows"],
        errorInDatabase: {
          error: false,
          message: ""
        }
      }

      this.firebase = this.props.firebase
      this.authUser = this.props.authUser
      this.userUid = this.authUser && this.props.authUser.uid
    }

    componentDidMount() {
      this._isMounted = true
      // this.getContent()
    }

    componentDidUpdate(prevProps) {
      if (this.props.authUser && this.props.authUser !== prevProps.authUser) {
        this.authUser = this.props.authUser
        this.userUid = this.props.authUser.uid

        // this.getContent()
      }
    }

    addShowToDatabase = (id, showToAdd, database) => {
      axios
        .get(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`)
        .then(({ data: { number_of_seasons } }) => {
          const maxSeasonsInChunk = 20
          const allSeasons = []
          const seasonChunks = []
          const apiRequests = []

          for (let i = 1; i <= number_of_seasons; i += 1) {
            allSeasons.push(`season/${i}`)
          }

          for (let i = 0; i <= allSeasons.length; i += maxSeasonsInChunk) {
            const chunk = allSeasons.slice(i, i + maxSeasonsInChunk)
            seasonChunks.push(chunk.join())
          }

          seasonChunks.forEach(item => {
            const request = axios.get(
              `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&append_to_response=${item}`
            )
            apiRequests.push(request)
          })

          return axios.all([...apiRequests])
        })
        .then(
          axios.spread((...responses) => {
            const rowData = []
            const seasonsData = []

            responses.forEach(item => {
              rowData.push(item.data)
            })

            const mergedRowData = Object.assign({}, ...rowData)

            Object.entries(mergedRowData).forEach(([key, value]) => {
              if (!key.indexOf("season/")) {
                const newKey = key.replace("/", "")
                seasonsData.push({ [newKey]: { ...value } })
              }
            })

            const allEpisodes = seasonsData

            const newShowRef = this.firebase[database](this.userUid).push()
            const newShowEpisodesRef = this.firebase.userContentEpisodes(this.userUid).push()
            const showKey = newShowRef.key
            const showEpisodesKey = newShowEpisodesRef.key

            newShowRef
              .set({
                ...showToAdd,
                showKey,
                showEpisodesKey,
                timeStamp: this.firebase.timeStamp()
              })
              .then(() => {
                this.firebase[database](this.userUid)
                  .child(showKey)
                  .once("value", snapshot => {
                    const negativeTimestamp = snapshot.val().timeStamp * -1
                    this.firebase[database](this.userUid)
                      .child(showKey)
                      .update({ timeStamp: negativeTimestamp }) // The negative time stamp needed for easier des order, cause firebase only provide as order
                  })
              })

            // newShowEpisodesRef.set({
            //   showName: showToAdd.original_name,
            //   episodes: allEpisodes,
            //   showKey,
            //   showEpisodesKey
            // })
          })
        )
        .catch(err => {
          console.log(err)
        })
    }

    addWatchingShow = (id, contentArr) => {
      // if (this.authUser === null) return
      // const showToAdd = contentArr && contentArr.find(item => item.id === id)
      // // let notWatchingShow
      // this.firebase
      //   .notWatchingShows(this.userUid)
      //   .orderByChild("id")
      //   .equalTo(id)
      //   .once("value", snapshot => {
      //     if (snapshot.val() !== null) {
      //       const show = snapshot.val()
      //         ? Object.keys(snapshot.val()).map(key => ({
      //             ...snapshot.val()[key]
      //           }))
      //         : []
      //       const newShowRef = this.firebase.watchingShows(this.userUid).push()
      //       this.firebase
      //         .watchingShows(this.userUid)
      //         .update(snapshot.val())
      //         .then(() => {
      //           this.firebase
      //             .notWatchingShows(this.userUid)
      //             .child(show[0].showKey)
      //             // .orderByChild("id")
      //             // .equalTo(id)
      //             .set(null)
      //         })
      //       // this.firebase
      //       //   .notWatchingShows(this.userUid)
      //       //   .child(notWatchingShow[0].showKey)
      //       //   .remove()
      //     } else {
      //       this.addShowToDatabase(id, showToAdd)
      //     }
      //   })
      // deleteShowFromSubDatabase(this.firebase, this.userUid, this.state.subDatabases, Number(id))
      // deleteShowFromSubDatabase(this.firebase, this.userUid, this.state.subDatabases, Number(id)).then(() => {
      //   if (!notWatchingShow) {
      //     this.addShowToDatabase(id, showToAdd)
      //   } else {
      //     // const key = showInDatabase.showKey
      //     // const userWatchingShow = true
      //     // const dropped = false
      //     // const willWatch = false
      //     // const newShowRef = this.firebase.watchingShows(this.userUid).push()
      //     // newShowRef.set({
      //     //   ...notWatchingShow
      //     // })
      //     // toggleWatchingShowsDatabase(this.firebase, this.userUid, key, userWatchingShow, dropped, willWatch)
      //   }
      // })
    }

    removeWatchingShow = id => {
      // if (this.authUser === null) return
      // this.firebase
      //   .watchingShows(this.userUid)
      //   .orderByChild("id")
      //   .equalTo(id)
      //   .once("value", snapshot => {
      //     if (snapshot.val() !== null) {
      //       const show = snapshot.val()
      //         ? Object.keys(snapshot.val()).map(key => ({
      //             ...snapshot.val()[key]
      //           }))
      //         : []
      //       const newShowRef = this.firebase.notWatchingShows(this.userUid).push()
      //       this.firebase
      //         .notWatchingShows(this.userUid)
      //         .update(snapshot.val())
      //         .then(() => {
      //           this.firebase
      //             .watchingShows(this.userUid)
      //             .child(show[0].showKey)
      //             // .orderByChild("id")
      //             // .equalTo(id)
      //             .set(null)
      //         })
      // this.firebase
      //   .notWatchingShows(this.userUid)
      //   .child(notWatchingShow[0].showKey)
      //   .remove()
      //   }
      // })
      // if (showInDatabase) {
      //   const key = showInDatabase.showKey
      //   const userWatchingShow = "false"
      //   const dropped = false
      //   const willWatch = false
      //   toggleWatchingShowsDatabase(this.firebase, this.userUid, key, userWatchingShow, dropped, willWatch)
      // }
    }

    handleShowInDatabases = (id, contentArr, database) => {
      const otherDatabases = this.state.subDatabases.filter(item => item !== database)

      const showToAdd = contentArr && contentArr.find(item => item.id === id)

      otherDatabases.forEach(item => {
        this.firebase[item](this.userUid)
          .orderByChild("id")
          .equalTo(id)
          .once(
            "value",
            snapshot => {
              if (snapshot.val() !== null) {
                const show = snapshot.val()
                  ? Object.keys(snapshot.val()).map(key => ({
                      ...snapshot.val()[key]
                    }))
                  : []

                this.firebase[database](this.userUid)
                  .update(snapshot.val())
                  .then(() => {
                    this.firebase[item](this.userUid)
                      .child(show[0].showKey)
                      .set(null)
                  })
              }
            },
            error => {
              console.log(`Error in database occured. ${error}`)

              this.setState({
                errorInDatabase: {
                  error: true,
                  message: `Error in database occured. ${error}`
                }
              })
            }
          )
      })

      this.firebase[database](this.userUid)
        .orderByChild("id")
        .equalTo(id)
        .once("value", snapshot => {
          if (snapshot.val() !== null) return
          this.addShowToDatabase(id, showToAdd, database)
        })
    }

    // addShowToSubDatabase = (id, contentArr, database, showInDatabase) => {
    //   if (this.authUser === null || showInDatabase.databases[database]) return

    //   const showToAdd = contentArr && contentArr.find(item => item.id === id)

    //   if (showInDatabase) {
    //     const key = showInDatabase.showKey
    //     const userWatchingShow = "false"
    //     toggleWatchingShowsDatabase(this.firebase, this.userUid, key, userWatchingShow)
    //   } else {
    //     this.addShowToDatabase(id, showToAdd)
    //   }

    //   const otherDatabases = this.state.subDatabases.filter(item => item !== database)

    //   deleteShowFromSubDatabase(this.firebase, this.userUid, otherDatabases, Number(id))
    // .then(() => {
    // const newShowRef = this.firebase[database](this.userUid).push()
    // const key = showInDatabase.showKey
    // const test = newShowRef.key

    // // const userWatchingShow = "false"
    // // const dropped = database === "droppedShows" ? true : false
    // // const willWatch = database === "willWatchShows" ? true : false

    // newShowRef.set({ ...showToAdd, showKey: key, key: test })

    // toggleWatchingShowsDatabase(this.firebase, this.userUid, key, userWatchingShow, dropped, willWatch)
    // })
    // }

    toggleWatchLaterMovie = (id, contentArr, movieInDatabase) => {
      if (this.authUser === null) return

      const movieToAdd = contentArr && contentArr.find(item => item.id === id)

      if (!movieInDatabase) {
        const newMovieRef = this.firebase.watchLaterMovies(this.userUid).push()
        const key = newMovieRef.key

        newMovieRef.set({ ...movieToAdd, key, timeStamp: this.firebase.timeStamp() })
      } else {
        const key = movieInDatabase.key

        this.firebase
          .watchLaterMovies(this.userUid)
          .child(key)
          .remove()
      }
    }

    getContent = () => {
      // if (this.userUid === null) return
      // this.setState({ loadingContent: true })
      // this.firebase.userContent(this.userUid).once("value", snapshot => {
      //   const userContent = snapshot.val() || {}
      //   const databases = ["watchingShows", "droppedShows", "willWatchShows", "watchLaterMovies"]
      //   databases.forEach(item => {
      //     if (!userContent.hasOwnProperty(item)) userContent[item] = {}
      //   })
      //   const test = {}
      //   Object.entries(userContent).forEach(([key, value]) => {
      //     const content =
      //       Object.keys(value).map(key => ({
      //         ...value[key],
      //         key
      //       })) || []
      //     test[key] = content
      //   })
      //   if (this._isMounted) {
      //     this.setState({
      //       ...test,
      //       loadingContent: false
      //     })
      //   }
      // const droppedTvShowsList = droppedShows
      //   ? Object.keys(droppedShows).map(key => ({
      //       ...droppedShows[key],
      //       key
      //     }))
      //   : []
      // })
    }

    componentWillUnmount() {
      this._isMounted = false
      // this.props.firebase.userContent(this.userUid).off()
    }

    render() {
      return (
        <Component
          {...this.props}
          userContent={this.state}
          addWatchingShow={this.addWatchingShow}
          removeWatchingShow={this.removeWatchingShow}
          addShowToSubDatabase={this.addShowToSubDatabase}
          toggleWatchLaterMovie={this.toggleWatchLaterMovie}
          handleShowInDatabases={this.handleShowInDatabases}
        />
      )
    }
  }
  return compose(withFirebase, WithAuthenticationConsumer)(WithUserContent)
}

export default withUserContent
