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

    addShowToUserDatabase = ({ id, show, database }) => {
      axios
        .get(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`)
        .then(({ data: { number_of_seasons, status } }) => {
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
                // Firebase can't handle "/" in database
                const newKey = key.replace("/", "")
                seasonsData.push({ [newKey]: { ...value } })
              }
            })

            let allEpisodes = []

            seasonsData.forEach((item, index) => {
              const season = item[`season${index + 1}`]
              let episodes = []

              season.episodes.forEach(item => {
                const updatedEpisode = {
                  air_date: item.air_date,
                  episode_number: item.episode_number,
                  name: item.name,
                  season_number: item.season_number,
                  watched: false
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

            // const showRefUser = this.firebase.userShows(this.userUid, database).push()
            // const showKey = showRefUser.key

            // const allShowsListSubDatabase =
            //   mergedRowData.status === "Ended" || mergedRowData.status === "Canceled" ? "ended" : "ongoing"
            // const showRefDatabase = this.firebase.allShowsList(allShowsListSubDatabase).push()
            // const showRefDatabaseKey = showRefDatabase.key

            // showRefUser
            //   .set({
            //     info: {
            //       ...show,
            //       showKey,
            //       showKeyDatabase: showRefDatabaseKey,
            //       timeStamp: this.firebase.timeStamp(),
            //       status: mergedRowData.status
            //     },
            //     episodes: {
            //       ...allEpisodes
            //     },
            //     id: show.id
            //   })
            //   .then(() => {
            //     this.firebase
            //       .userShows(this.userUid, database)
            //       .child(showKey)
            //       .once("value", snapshot => {
            //         console.log(snapshot.val())
            //         const negativeTimestamp = snapshot.val().info.timeStamp * -1
            //         this.firebase
            //           // .userShows(this.userUid, database)
            //           // .child(showKey)
            //           // .child("info")
            //           .userShowInfo(this.userUid, showKey, database)
            //           .update({ timeStamp: negativeTimestamp }) // The negative time stamp needed for easier des order, cause firebase only provide as order
            //       })
            //   })

            this.addShowToDatabase({
              id,
              show,
              episodes: allEpisodes,
              userDatabase: database,
              status: mergedRowData.status
            })

            // showRefDatabase.set({
            //   info: {
            //     ...show,
            //     status: mergedRowData.status
            //   },
            //   episodes: {
            //     ...allEpisodes
            //   },
            //   id: show.id
            // })
          })
        )
        .catch(err => {
          console.log(err)
        })
    }

    addShowToDatabase = ({ id, show, episodes, userDatabase, status }) => {
      const showRefUser = this.firebase.userShows(this.userUid, userDatabase).push()
      const showKey = showRefUser.key

      const allShowsListSubDatabase = status === "Ended" || status === "Canceled" ? "ended" : "ongoing"

      showRefUser
        .set({
          info: {
            ...show,
            showKey,
            timeStamp: this.firebase.timeStamp(),
            status
          },
          episodes,
          id
        })
        .then(() => {
          this.firebase
            .userShows(this.userUid, userDatabase)
            .child(showKey)
            .once("value", snapshot => {
              console.log(snapshot.val())
              const negativeTimestamp = snapshot.val().info.timeStamp * -1
              this.firebase
                // .userShows(this.userUid, database)
                // .child(showKey)
                // .child("info")
                .userShowInfo(this.userUid, showKey, userDatabase)
                .update({ timeStamp: negativeTimestamp }) // The negative time stamp needed for easier des order, cause firebase only provide as order
            })
        })

      this.firebase
        .allShowsList(allShowsListSubDatabase)
        .child(id)
        .transaction(
          snapshot => {
            if (snapshot === null) {
              const showRefDatabase = this.firebase.allShowsList(allShowsListSubDatabase).push()
              const showRefDatabaseKey = showRefDatabase.key
              return {
                info: {
                  ...show,
                  status
                },
                episodes,
                id
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
              let show = {}

              Object.keys(snapshot.val()).forEach(key => {
                show = { ...snapshot.val()[key], key }
              })

              this.firebase.userShowInfo(this.userUid, showKey, userDatabase).update({ showKeyDatabase: id })
            } else {
              console.log("added!")

              let show = {}

              Object.keys(snapshot.val()).forEach(key => {
                show = { ...snapshot.val()[key], key }
              })

              this.firebase.userShowInfo(this.userUid, showKey, userDatabase).update({ showKeyDatabase: id })
            }
            console.log("show's data: ", snapshot.val())
          }
        )

      // this.firebase
      //   .allShowsList(allShowsListSubDatabase)
      //   .orderByChild("id")
      //   .equalTo(id)
      //   .once("value", snapshot => {
      //     if (snapshot.val() !== null) {
      //       let show = {}

      //       Object.keys(snapshot.val()).forEach(key => {
      //         show = { ...snapshot.val()[key], key }
      //       })

      //       this.firebase
      //         .userShowInfo(this.userUid, showKey, userDatabase)
      //         .update({ showKeyDatabase: show.key })
      //     } else {
      //       const showRefDatabase = this.firebase.allShowsList(allShowsListSubDatabase).push({}, error => {
      //         if (error) {
      //           console.log("error")
      //         } else {
      //           console.log(showRefDatabase.key)
      //           console.log("pushed")

      //           this.firebase
      //             .allShowsList(allShowsListSubDatabase)
      //             .child(showRefDatabase.key)
      //             .transaction(
      //               snapshot => {
      //                 console.log(snapshot)
      //                 if (snapshot === null) {
      //                   // const showRefDatabase = this.firebase.allShowsList(allShowsListSubDatabase).push()
      //                   // const showRefDatabaseKey = showRefDatabase.key
      //                   return {
      //                     info: {
      //                       ...show,
      //                       status
      //                     },
      //                     episodes,
      //                     id
      //                   }
      //                 } else {
      //                   console.log("allready exists")
      //                   return
      //                 }
      //               },
      //               (error, committed, snapshot) => {
      //                 if (error) {
      //                   console.log("Transaction failed abnormally!", error)
      //                 } else if (!committed) {
      //                   console.log("We aborted the transaction (because allready exists).")
      //                   let show = {}

      //                   Object.keys(snapshot.val()).forEach(key => {
      //                     show = { ...snapshot.val()[key], key }
      //                   })

      //                   this.firebase
      //                     .userShowInfo(this.userUid, showKey, userDatabase)
      //                     .update({ showKeyDatabase: showRefDatabase.key })
      //                 } else {
      //                   console.log("added!")

      //                   let show = {}

      //                   Object.keys(snapshot.val()).forEach(key => {
      //                     show = { ...snapshot.val()[key], key }
      //                   })

      //                   this.firebase
      //                     .userShowInfo(this.userUid, showKey, userDatabase)
      //                     .update({ showKeyDatabase: showRefDatabase.key })
      //                 }
      //                 console.log("show's data: ", snapshot.val())
      //               }
      //             )
      //         }
      //       })
      //       // const showRefDatabaseKey = showRefDatabase.key

      //       // showRefDatabase.transaction(snapshot => {})

      //       // showRefDatabase
      //       //   .set({
      //       //     info: {
      //       //       ...show,
      //       //       status
      //       //     },
      //       //     episodes,
      //       //     id
      //       //   })
      //       //   .then(() => {
      //       //     this.firebase
      //       //       .userShowInfo(this.userUid, showKey, userDatabase)
      //       //       .update({ showKeyDatabase: showRefDatabaseKey })
      //       //   })
      //     }
      //   })

      // this.firebase
      //   .allShowsList(database)
      //   .child(ref.key)
      //   .once("value", snapshot => {
      //     if (snapshot.val() !== null) return

      //     ref.set({
      //       info: {
      //         ...show,
      //         status: database
      //       },
      //       episodes,
      //       id: show.id
      //     })
      //   })
    }

    handleShowInDatabases = ({ id, data = [], database, callback = () => {} }) => {
      const otherDatabases = this.state.showsDatabases.filter(item => item !== database)

      const showToAdd = Array.isArray(data) ? data.find(item => item.id === id) : data

      const promises = []

      otherDatabases.forEach(item => {
        const promise = this.firebase
          .userShows(this.userUid, item)
          .orderByChild("id")
          .equalTo(id)
          .once(
            "value",
            snapshot => {
              if (snapshot.val() !== null) {
                let show = {}

                Object.keys(snapshot.val()).forEach(key => {
                  show = { ...snapshot.val()[key], key }
                })

                this.firebase
                  .userShows(this.userUid, database)
                  .update(snapshot.val())
                  .then(() => {
                    this.firebase
                      .userShows(this.userUid, item)
                      .child(show.key)
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
          .orderByChild("id")
          .equalTo(id)
          .once("value", snapshot => {
            console.log("test")
            if (snapshot.val() !== null) return
            console.log("test2")
            this.addShowToUserDatabase({ id, show: showToAdd, database })
          })
      })
    }

    toggleWatchLaterMovie = ({ id, data = [], database }) => {
      if (this.authUser === null) return

      const movieToAdd = Array.isArray(data) ? data.find(item => item.id === id) : data

      this.firebase[database](this.userUid)
        .orderByChild("id")
        .equalTo(id)
        .once("value", snapshot => {
          if (snapshot.val() !== null) {
            let movie = {}

            Object.keys(snapshot.val()).forEach(key => {
              movie = { ...snapshot.val()[key], key }
            })

            this.firebase[database](this.userUid)
              .child(movie.movieKey)
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
