import React from "react"
import { withFirebase } from "Components/Firebase"
import { compose } from "recompose"
import axios from "axios"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"

const withUserContent = Component => {
  class WithUserContent extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        watchingShows: [],
        droppedShows: [],
        willWatchShows: [],
        watchLaterMovies: [],
        showsDatabases: ["watchingShows", "notWatchingShows", "droppedShows", "willWatchShows"],
        moviesDatabases: ["watchLaterMovies"],
        errorInDatabase: {
          error: false,
          message: ""
        }
      }

      this.firebase = this.props.firebase
      this.authUser = this.props.authUser
      this.userUid = this.authUser && this.props.authUser.uid
    }

    componentDidUpdate(prevProps) {
      if (this.props.authUser && this.props.authUser !== prevProps.authUser) {
        this.authUser = this.props.authUser
        this.userUid = this.props.authUser.uid
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

    handleShowInDatabases = (id, contentArr, database, callback = () => {}) => {
      console.log(callback)
      const otherDatabases = this.state.showsDatabases.filter(item => item !== database)

      const showToAdd = contentArr && contentArr.find(item => item.id === id)

      const promises = []

      otherDatabases.forEach(item => {
        const promise = this.firebase[item](this.userUid)
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

        promises.push(promise)
      })

      Promise.all(promises).then(() => {
        callback()
      })

      this.firebase[database](this.userUid)
        .orderByChild("id")
        .equalTo(id)
        .once("value", snapshot => {
          if (snapshot.val() !== null) return
          this.addShowToDatabase(id, showToAdd, database)
        })
    }

    toggleWatchLaterMovie = (id, contentArr, database) => {
      if (this.authUser === null) return

      const movieToAdd = contentArr && contentArr.find(item => item.id === id)

      this.firebase[database](this.userUid)
        .orderByChild("id")
        .equalTo(id)
        .once("value", snapshot => {
          if (snapshot.val() !== null) {
            const movie = snapshot.val()
              ? Object.keys(snapshot.val()).map(key => ({
                  ...snapshot.val()[key]
                }))
              : []

            this.firebase[database](this.userUid)
              .child(movie[0].movieKey)
              .set(null)
          } else {
            const newMovieRef = this.firebase[database](this.userUid).push()
            const movieKey = newMovieRef.key

            newMovieRef
              .set({
                ...movieToAdd,
                movieKey,
                timeStamp: this.firebase.timeStamp()
              })
              .then(() => {
                this.firebase[database](this.userUid)
                  .child(movieKey)
                  .once("value", snapshot => {
                    if (snapshot.val() === null) return

                    const negativeTimestamp = snapshot.val().timeStamp * -1
                    this.firebase[database](this.userUid)
                      .child(movieKey)
                      .update({ timeStamp: negativeTimestamp }) // The negative time stamp needed for easier des order, cause firebase only provide as order
                  })
              })
          }
        })
    }

    render() {
      return (
        <Component
          {...this.props}
          userContent={this.state}
          toggleWatchLaterMovie={this.toggleWatchLaterMovie}
          handleShowInDatabases={this.handleShowInDatabases}
        />
      )
    }
  }
  return compose(withFirebase, WithAuthenticationConsumer)(WithUserContent)
}

export default withUserContent
