import React from "react"
import { withFirebase } from "Components/Firebase"
import { compose } from "recompose"
import * as _get from "lodash.get"
import mergeEpisodesWithAirDate from "Utils/mergeEpisodesWithAirDate"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import { AppContext } from "Components/AppContext/AppContextHOC"
import addShowToMainDatabase from "./FirebaseHelpers/addShowToMainDatabase"
import getShowEpisodesFromAPI from "./TmdbAPIHelpers/getShowEpisodesFromAPI"

const userContentHandler = (Component) => {
  class UserContentHandler extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
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

    addShowsToDatabaseOnRegister = ({ shows }) => {
      Promise.all(
        Object.values(shows).map((show) => {
          return getShowEpisodesFromAPI({ id: show.id }).then((dataFromAPI) => {
            const showsSubDatabase =
              dataFromAPI.status === "Ended" || dataFromAPI.status === "Canceled" ? "ended" : "ongoing"

            const userEpisodes = dataFromAPI.episodes.reduce((acc, season) => {
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

            addShowToMainDatabase({ firebase: this.firebase, show, dataFromAPI })

            return { showInfo, userEpisodes }
          })
        })
      ).then((data) => {
        const userShows = data.reduce((acc, show) => {
          const showInfo = { ...show.showInfo }
          return { ...acc, [show.showInfo.id]: showInfo }
        }, {})

        const userEpisodes = data.reduce((acc, show) => {
          const showEpisodes = { ...show.userEpisodes }
          return {
            ...acc,
            [show.showInfo.id]: {
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

    addShowToDatabase = ({ id, show, userDatabase, callback }) => {
      getShowEpisodesFromAPI({ id }).then((dataFromAPI) => {
        console.log("addShowInDatabase run in function body")

        const showsSubDatabase =
          dataFromAPI.status === "Ended" || dataFromAPI.status === "Canceled" ? "ended" : "ongoing"

        const userEpisodes = dataFromAPI.episodes.reduce((acc, season) => {
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

        addShowToMainDatabase({ firebase: this.firebase, show, dataFromAPI, callback })
      })
    }

    handleShowInDatabases = ({ id, data = [], database, userShows, fullContentPage = false, callback }) => {
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
          handleMovieInDatabases={this.handleMovieInDatabases}
          handleShowInDatabases={this.handleShowInDatabases}
          addShowToDatabase={this.addShowToDatabase}
          addShowsToDatabaseOnRegister={this.addShowsToDatabaseOnRegister}
        />
      )
    }
  }
  UserContentHandler.contextType = AppContext
  return compose(withFirebase, WithAuthenticationConsumer)(UserContentHandler)
}

export default userContentHandler
