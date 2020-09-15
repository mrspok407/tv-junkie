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
        userShowsDatabases: {
          watchingShows: [],
          droppedShows: [],
          willWatchShows: [],
          finishedShows: []
        },
        userShows: [],
        loadingShows: false,
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
      this.userUid = this.authUser && this.authUser.uid
    }

    componentDidMount() {
      // this.handleShowsListener()
      // this.handleShowsListenerNew()
    }

    componentWillUnmount() {
      // this.firebase.userAllShows(this.userUid).off()
    }

    componentDidUpdate(prevProps) {
      if (this.props.authUser && this.props.authUser !== prevProps.authUser) {
        this.authUser = this.props.authUser
        this.userUid = this.props.authUser.uid
      }
    }

    getShowEpisodes = ({ id }) => {
      const promise = axios
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
                seasonsData.push({ [key]: { ...value } })
              }
            })

            let allEpisodes = []

            seasonsData.forEach((item, index) => {
              const season = item[`season/${index + 1}`]
              if (
                !Array.isArray(season.episodes) ||
                season.episodes.length === 0 ||
                season.air_date.length === 0
              )
                return

              let episodes = []

              season.episodes.forEach(item => {
                const updatedEpisode = {
                  air_date: item.air_date,
                  episode_number: item.episode_number,
                  name: item.name,
                  season_number: item.season_number,
                  id: item.id
                }
                episodes.push(updatedEpisode)
              })

              const updatedSeason = {
                air_date: season.air_date,
                season_number: season.season_number,
                id: season._id,
                poster_path: season.poster_path,
                name: season.name,
                episodes
              }

              allEpisodes.push(updatedSeason)
            })

            const dataToPass = {
              episodes: allEpisodes,
              status: mergedRowData.status
            }

            return dataToPass
          })
        )
        .catch(err => {
          console.log(err)
        })

      return promise
    }

    addShowToDatabase = ({ id, show, userDatabase, userUid = this.userUid }) => {
      this.getShowEpisodes({ id }).then(data => {
        const showsSubDatabase = data.status === "Ended" || data.status === "Canceled" ? "ended" : "ongoing"

        // const userEpisodes = []

        const userEpisodes = data.episodes.reduce((acc, season) => {
          const episodes = season.episodes.map(() => {
            return { watched: false, userRating: 0 }
          })

          acc.push({ season_number: season.season_number, episodes, userRating: 0 })
          return acc
        }, [])

        console.log("hhhhhhhhhh")

        this.firebase
          .userAllShows(userUid)
          .child(id)
          .set({
            database: userDatabase,
            status: showsSubDatabase,
            firstAirDate: show.first_air_date,
            name: show.name || show.original_name,
            timeStamp: this.firebase.timeStamp(),
            finished: false,
            id
          })

        this.props.firebase
          .userEpisodes(userUid)
          .child(id)
          .set({
            episodes: userEpisodes,
            info: {
              allEpisodesWatched: false,
              finished: false
            }
          })

        this.firebase
          .allShowsList(showsSubDatabase)
          .child(id)
          .transaction(
            snapshot => {
              if (snapshot === null) {
                return {
                  info: {
                    ...show,
                    status: data.status
                  },
                  episodes: data.episodes,
                  id,
                  usersWatching: 1
                }
              } else {
                return
              }
            },
            (error, committed, snapshot) => {
              if (error) {
                // console.log("Transaction failed abnormally!", error)
              } else if (!committed) {
                // console.log("We aborted the transaction (because allready exists).")
                this.firebase
                  .allShowsList(showsSubDatabase)
                  .child(id)
                  .update({
                    usersWatching: snapshot.val().usersWatching + 1
                  })
              } else {
                // console.log("added!")
              }
            }
          )
      })
    }

    handleShowInDatabases = ({ id, data = [], database, userShows }) => {
      const allreadyInDatabase = userShows.find(show => show.id === id)

      if (allreadyInDatabase) {
        this.firebase
          .userShow({ uid: this.userUid, key: id })
          .update({
            database
          })
          .catch(error => {
            console.log(`Error in database occured. ${error}`)

            this.setState({
              errorInDatabase: {
                error: true,
                message: `Error in database occured. ${error}`
              }
            })
          })
      } else {
        const showData = Array.isArray(data) ? data.find(item => item.id === id) : data
        this.addShowToDatabase({ id, show: showData, userDatabase: database })
      }
    }

    toggleWatchLaterMovie = ({ id, data = [], userDatabase, userUid = this.userUid }) => {
      const movieToAdd = Array.isArray(data) ? data.find(item => item.id === id) : data

      this.firebase[userDatabase](userUid)
        .child(id)
        .once("value", snapshot => {
          if (snapshot.val() !== null) {
            this.firebase[userDatabase](userUid)
              .child(id)
              .set(null)
          } else {
            this.firebase[userDatabase](userUid)
              .child(id)
              .set({
                ...movieToAdd,
                timeStamp: this.firebase.timeStamp()
              })
              .then(() => {
                this.firebase[userDatabase](userUid)
                  .child(id)
                  .once("value", snapshot => {
                    if (snapshot.val() === null) return

                    const negativeTimestamp = snapshot.val().timeStamp * -1
                    this.firebase[userDatabase](userUid)
                      .child(id)
                      .update({ timeStamp: negativeTimestamp }) // The negative time stamp needed for easier des order, cause firebase only provide as order
                  })
              })
          }
        })
    }

    handleShowsListenerOnClient = ({ activeSection = "watchingShows", id }) => {
      const removedShow = this.state.userShowsDatabases[activeSection].find(item => item.id === id)
      const filteredShows = this.state.userShowsDatabases[activeSection].filter(item => item.id !== id)

      this.setState({
        userShowsDatabases: {
          ...this.state.userShowsDatabases,
          watchingShows: activeSection !== "watchingShows" && [
            ...this.state.userShowsDatabases.watchingShows,
            removedShow
          ],
          [activeSection]: filteredShows
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
          addShowToDatabase={this.addShowToDatabase}
          handleShowsListenerOnClient={this.handleShowsListenerOnClient}
        />
      )
    }
  }
  return compose(withFirebase, WithAuthenticationConsumer)(WithUserContent)
}

export default withUserContent
