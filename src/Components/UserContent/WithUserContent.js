import React from "react"
import { withFirebase } from "Components/Firebase"
import { compose } from "recompose"
import axios from "axios"
import * as _get from "lodash.get"
import mergeEpisodesWithAirDate from "Utils/mergeEpisodesWithAirDate"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import { AppContext } from "Components/AppContext/AppContextHOC"

const withUserContent = (Component) => {
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

          seasonChunks.forEach((item) => {
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

            responses.forEach((item) => {
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

              season.episodes.forEach((item) => {
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
        .catch((err) => {
          console.log(err)
        })

      return promise
    }

    addShowToDatabaseOnRegister = ({ shows }) => {
      Promise.all(
        Object.values(shows).map((show) => {
          return this.getShowEpisodes({ id: show.id }).then((data) => {
            const showsSubDatabase =
              data.status === "Ended" || data.status === "Canceled" ? "ended" : "ongoing"

            const userEpisodes = data.episodes.reduce((acc, season) => {
              const episodes = season.episodes.map(() => {
                return { watched: false, userRating: 0 }
              })

              acc.push({ season_number: season.season_number, episodes, userRating: 0 })
              return acc
            }, [])

            const showInfo = {
              allEpisodesWatched: false,
              finished: false,
              database: "watchingShows",
              status: showsSubDatabase,
              firstAirDate: show.first_air_date,
              name: show.name,
              timeStamp: this.firebase.timeStamp(),
              id: show.id
            }

            this.firebase.showInDatabase(show.id).transaction(
              (snapshot) => {
                if (snapshot === null) {
                  return {
                    info: {
                      backdrop_path: show.backdrop_path,
                      first_air_date: show.first_air_date,
                      genre_ids: show.genre_ids,
                      id: show.id,
                      name: show.name,
                      original_name: show.original_name,
                      overview: show.overview,
                      poster_path: show.poster_path,
                      vote_average: show.vote_average,
                      vote_count: show.vote_count,
                      status: data.status
                    },
                    episodes: data.episodes,
                    id: show.id.toString(),
                    usersWatching: 1
                  }
                } else {
                  return
                }
              },
              (error, committed, snapshot) => {
                if (error) {
                  console.log("Transaction failed abnormally!", error)
                } else if (!committed) {
                  console.log("We aborted the transaction (because allready exists).")
                  this.firebase.showInDatabase(show.id).update({
                    usersWatching: snapshot.val().usersWatching + 1
                  })

                  // callback({ status: data.status })
                } else {
                  // callback({ status: data.status })
                  console.log("added!")
                }
              }
            )

            return [showInfo, userEpisodes]
          })
        })
      ).then((data) => {
        const userShows = data.reduce((acc, show) => {
          const showInfo = { ...show[0] }
          return { ...acc, [show[0].id]: showInfo }
        }, {})

        const userEpisodes = data.reduce((acc, show) => {
          const showEpisodes = { ...show[1] }
          return {
            ...acc,
            [show[0].id]: {
              info: { allEpisodesWatched: false, finished: false, database: "watchingShows" },
              episodes: showEpisodes
            }
          }
        }, {})

        this.firebase.auth.onAuthStateChanged((auth) => {
          console.log(auth)
          if (!auth) return

          this.firebase.userAllShows(auth.uid).set(userShows)
          this.firebase.userEpisodes(auth.uid).set(userEpisodes)
        })

        console.log(userShows)
        console.log(userEpisodes)
      })
    }

    addShowToDatabase = ({ id, show, userDatabase, callback = () => {} }) => {
      this.getShowEpisodes({ id }).then((data) => {
        console.log("addShowInDatabase run in function body")

        const showsSubDatabase = data.status === "Ended" || data.status === "Canceled" ? "ended" : "ongoing"

        const userEpisodes = data.episodes.reduce((acc, season) => {
          const episodes = season.episodes.map(() => {
            return { watched: false, userRating: 0 }
          })

          acc.push({ season_number: season.season_number, episodes, userRating: 0 })
          return acc
        }, [])

        console.log(this.authUser)

        this.firebase.auth.onAuthStateChanged((auth) => {
          console.log(auth)
          if (!auth) return

          this.firebase.userAllShows(auth.uid).child(id).set({
            database: userDatabase,
            status: showsSubDatabase,
            firstAirDate: show.first_air_date,
            name: show.name,
            timeStamp: this.firebase.timeStamp(),
            finished: false,
            id
          })

          this.props.firebase
            .userEpisodes(auth.uid)
            .child(id)
            .set({
              episodes: userEpisodes,
              info: {
                database: userDatabase,
                allEpisodesWatched: false,
                finished: false
              }
            })
        })

        this.firebase.showInDatabase(id).transaction(
          (snapshot) => {
            if (snapshot === null) {
              return {
                info: {
                  backdrop_path: show.backdrop_path,
                  first_air_date: show.first_air_date,
                  genre_ids: show.genre_ids,
                  id: show.id,
                  name: show.name,
                  original_name: show.original_name,
                  overview: show.overview,
                  poster_path: show.poster_path,
                  vote_average: show.vote_average,
                  vote_count: show.vote_count,
                  status: data.status
                },
                episodes: data.episodes,
                id: id.toString(),
                usersWatching: 1
              }
            } else {
              return
            }
          },
          (error, committed, snapshot) => {
            if (error) {
              console.log("Transaction failed abnormally!", error)
            } else if (!committed) {
              console.log("We aborted the transaction (because allready exists).")
              this.firebase.showInDatabase(id).update({
                usersWatching: snapshot.val().usersWatching + 1
              })

              callback({ status: data.status })
            } else {
              callback({ status: data.status })
              console.log("added!")
            }
          }
        )
      })
    }

    handleShowInDatabases = ({
      id,
      data = [],
      database,
      userShows,
      fullContentPage = false,
      callback = () => {}
    }) => {
      const userShow = userShows.find((show) => show.id === id)

      if (userShow) {
        this.firebase.userShow({ uid: this.userUid, key: id }).update({
          database
        })

        this.props.firebase
          .userShowAllEpisodesInfo(this.userUid, id)
          .update(
            {
              database
            },
            () => {
              if (fullContentPage) return
              this.props.firebase.userShowEpisodes(this.userUid, id).once("value", (snapshot) => {
                const showEpisodes = snapshot.val().episodes
                const showInfo = snapshot.val().info

                const episodesFullData = _get(
                  this.context.userContent.userShows.find((show) => show.id === id),
                  "episodes",
                  []
                )

                const episodesWithAirDate = mergeEpisodesWithAirDate({
                  fullData: episodesFullData,
                  userData: showEpisodes
                })

                this.props.firebase
                  .userShowAllEpisodesNotFinished(this.userUid, id)
                  .set(
                    showInfo.allEpisodesWatched || showInfo.database !== "watchingShows"
                      ? null
                      : episodesWithAirDate
                  )
              })
            }
          )
          .catch((error) => {
            console.log(`Error in database occured. ${error}`)

            this.setState({
              errorInDatabase: {
                error: true,
                message: `Error in database occured. ${error}`
              }
            })
          })

        this.firebase
          .showInDatabase(id)
          .child("usersWatching")
          .once("value", (snapshot) => {
            const currentUsersWatching = snapshot.val()
            const prevDatabase = userShow.database

            this.firebase.showInDatabase(id).update({
              usersWatching:
                database === "watchingShows"
                  ? currentUsersWatching + 1
                  : prevDatabase !== "watchingShows"
                  ? currentUsersWatching
                  : currentUsersWatching - 1
            })
          })
      } else {
        const showData = Array.isArray(data) ? data.find((item) => item.id === id) : data
        this.addShowToDatabase({ id, show: showData, userDatabase: database, callback })
      }
    }

    handleMovieInDatabases = ({ id, data = [], userDatabase }) => {
      const movie = Array.isArray(data) ? data.find((item) => item.id === id) : data

      this.firebase[userDatabase](this.userUid)
        .child(id)
        .once("value", (snapshot) => {
          if (snapshot.val() !== null) {
            this.firebase[userDatabase](this.userUid).child(id).set(null)
          } else {
            this.firebase[userDatabase](this.userUid).child(id).set({
              id: movie.id,
              title: movie.title,
              release_date: movie.release_date,
              vote_average: movie.vote_average,
              vote_count: movie.vote_count,
              backdrop_path: movie.backdrop_path,
              overview: movie.overview,
              genre_ids: movie.genre_ids,
              timeStamp: this.firebase.timeStamp()
            })
          }
        })
    }

    render() {
      return (
        <Component
          {...this.props}
          userContent={this.state}
          handleMovieInDatabases={this.handleMovieInDatabases}
          handleShowInDatabases={this.handleShowInDatabases}
          addShowToDatabase={this.addShowToDatabase}
          addShowToDatabaseOnRegister={this.addShowToDatabaseOnRegister}
        />
      )
    }
  }
  WithUserContent.contextType = AppContext
  return compose(withFirebase, WithAuthenticationConsumer)(WithUserContent)
}

export default withUserContent
