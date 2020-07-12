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

    getShowEpisodes = async ({ id }) => {
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
              let episodes = []

              season.episodes.forEach(item => {
                const updatedEpisode = {
                  air_date: item.air_date,
                  episode_number: item.episode_number,
                  name: item.name,
                  season_number: item.season_number
                }
                episodes.push(updatedEpisode)
              })

              const updatedSeason = {
                air_date: season.air_date,
                season_number: season.season_number,
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

    addShowToDatabase = ({ id, show, userDatabase }) => {
      console.log(show)
      this.getShowEpisodes({ id }).then(data => {
        const allShowsListSubDatabase =
          data.status === "Ended" || data.status === "Canceled" ? "ended" : "ongoing"

        const userEpisodes = []

        data.episodes.forEach(season => {
          let episodes = []

          season.episodes.forEach(() => {
            const updatedEpisode = {
              watched: false
            }
            episodes.push(updatedEpisode)
          })

          const updatedSeason = {
            season_number: season.season_number,
            episodes
          }

          userEpisodes.push(updatedSeason)
        })

        this.firebase
          .userShows(this.userUid, userDatabase)
          .child(id)
          .set({
            status: data.status,
            firstAirData: show.first_air_date,
            name: show.name || show.original_name,
            timeStamp: this.firebase.timeStamp(),
            episodes: userEpisodes,
            id
          })
          .then(() => {
            this.firebase
              .userShows(this.userUid, userDatabase)
              .child(id)
              .once("value", snapshot => {
                const negativeTimestamp = snapshot.val().timeStamp * -1

                this.firebase
                  .userShows(this.userUid, userDatabase)
                  .child(id)
                  .update({
                    timeStamp: negativeTimestamp // The negative time stamp needed for easier des order, cause firebase only provide as order
                  })
              })
          })

        this.firebase
          .allShowsList(allShowsListSubDatabase)
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
                console.log("allready exists")
                return
              }
            },
            (error, committed, snapshot) => {
              if (error) {
                console.log("Transaction failed abnormally!", error)
              } else if (!committed) {
                console.log("We aborted the transaction (because allready exists).")
                this.firebase
                  .allShowsList(allShowsListSubDatabase)
                  .child(id)
                  .update({
                    usersWatching: snapshot.val().usersWatching + 1
                  })
              } else {
                console.log("added!")
              }
            }
          )
      })
    }

    handleShowInDatabases = ({ id, data = [], database, callback = () => {} }) => {
      const otherDatabases = this.state.showsDatabases.filter(item => item !== database)

      const show = Array.isArray(data) ? data.find(item => item.id === id) : data

      const promises = []

      otherDatabases.forEach(item => {
        const promise = this.firebase
          .userShows(this.userUid, item)
          .child(id)
          .once(
            "value",
            snapshot => {
              if (snapshot.val() !== null) {
                this.firebase
                  .userShows(this.userUid, database)
                  .child(id)
                  .set({
                    ...snapshot.val()
                  })
                  .then(() => {
                    this.firebase
                      .userShows(this.userUid, item)
                      .child(id)
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

        this.firebase
          .userShows(this.userUid, database)
          .child(id)
          .once("value", snapshot => {
            if (snapshot.val() !== null) return
            this.addShowToDatabase({ id, show: show, userDatabase: database })
          })
      })
    }

    toggleWatchLaterMovie = ({ id, data = [], database }) => {
      if (this.authUser === null) return

      const movieToAdd = Array.isArray(data) ? data.find(item => item.id === id) : data

      this.firebase[database](this.userUid)
        .child(id)
        .once("value", snapshot => {
          if (snapshot.val() !== null) {
            this.firebase[database](this.userUid)
              .child(id)
              .set(null)
          } else {
            this.firebase[database](this.userUid)
              .child(id)
              .set({
                ...movieToAdd,
                timeStamp: this.firebase.timeStamp()
              })
              .then(() => {
                this.firebase[database](this.userUid)
                  .child(id)
                  .once("value", snapshot => {
                    if (snapshot.val() === null) return

                    const negativeTimestamp = snapshot.val().timeStamp * -1
                    this.firebase[database](this.userUid)
                      .child(id)
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
