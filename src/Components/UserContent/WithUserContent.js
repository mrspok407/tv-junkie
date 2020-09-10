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
      this.handleShowsListenerNew()
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

        // this.firebase
        //   .userShows(userUid, userDatabase)
        //   .child(id)
        //   .set({
        //     // allEpisodesWatched: false,
        //     status: showsSubDatabase,
        //     firstAirDate: show.first_air_date,
        //     name: show.name || show.original_name,
        //     timeStamp: this.firebase.timeStamp(),
        //     finished: false,
        //     // episodes: userEpisodes,
        //     id
        //     // finished_and_name: `false_${show.name || show.original_name}` // I need this cause Firebase can't filter by more than one query on the server
        //     //  finished_and_timeStamp: `false_${3190666598976 - this.firebase.timeStamp()}` // This is one of the approaches recommended by Firebase developer Puf
        //   })
        //   .then(() => {
        //     this.firebase
        //       .userShows(userUid, userDatabase)
        //       .child(id)
        //       .once("value", snapshot => {
        //         const negativeTimestamp = snapshot.val().timeStamp * -1
        //         // const finishedTimestamp = 3190666598976 - snapshot.val().timeStamp

        //         this.firebase
        //           .userShows(userUid, userDatabase)
        //           .child(id)
        //           .update({
        //             timeStamp: negativeTimestamp // The negative time stamp needed for easier des order, cause firebase only provide asc order
        //             // finished_and_timeStamp: `false_${finishedTimestamp}`
        //           })
        //       })
        //   })

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

    handleShowInDatabases = ({ id, data = [], database }) => {
      const allreadyInDatabase = this.state.userShows.find(show => show.id === id)

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

      // showRef.once("value", snapshot => {
      //   if (snapshot.val() !== null) {
      //     showRef.update(
      //       {
      //         database
      //       },
      //       error => {
      //         console.log(`Error in database occured. ${error}`)

      //         this.setState({
      //           errorInDatabase: {
      //             error: true,
      //             message: `Error in database occured. ${error}`
      //           }
      //         })
      //       }
      //     )
      //   } else {
      //     this.addShowToDatabase({ id, show: showData, userDatabase: database })
      //   }
      // })

      // const otherDatabases = this.state.showsDatabases.filter(item => item !== database)

      // const promises = []

      // otherDatabases.forEach(item => {
      //   const promise = this.firebase
      //     .userShows(this.userUid, item)
      //     .child(id)
      //     .once(
      //       "value",
      //       snapshot => {
      //         if (snapshot.val() !== null) {
      //           this.firebase
      //             .userShows(this.userUid, database)
      //             .child(id)
      //             .set({
      //               ...snapshot.val()
      //             })
      //             .then(() => {
      //               this.firebase
      //                 .userShows(this.userUid, item)
      //                 .child(id)
      //                 .set(null)
      //             })
      //         }
      //       },
      //       error => {
      //         console.log(`Error in database occured. ${error}`)

      //         this.setState({
      //           errorInDatabase: {
      //             error: true,
      //             message: `Error in database occured. ${error}`
      //           }
      //         })
      //       }
      //     )

      //   promises.push(promise)
      // })

      // Promise.all(promises).then(() => {
      //   this.firebase
      //     .userShows(this.userUid, database)
      //     .child(id)
      //     .once("value", snapshot => {
      //       if (snapshot.val() !== null) return
      //       this.addShowToDatabase({ id, show: showData, userDatabase: database })
      //     })
      // })
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

    handleShowsListenerNew = () => {
      this.setState({ loadingShows: true })

      this.firebase.userAllShows(this.userUid).on("value", snapshot => {
        if (snapshot.val() === null) {
          this.setState({ loadingShows: false })
          return
        }

        const userShows = Object.values(snapshot.val()).map(show => {
          return show
        })

        console.log("updated userContent")

        this.setState({
          userShows: userShows,
          loadingShows: false
        })

        // let mergedShows = []

        // userShows.forEach((show, index, array) => {
        //   this.firebase.showInfo(show.status, show.id).on("value", snapshot => {
        //     mergedShows = [...mergedShows, { ...show, ...snapshot.val() }]

        //     if (array.length === index + 1) {
        //       console.log("updated userContent")

        //       this.setState({
        //         userShows: mergedShows,
        //         loadingShows: false
        //       })
        //     }
        //   })
        // })
      })
    }

    handleShowsListener = () => {
      this.setState({ loadingShows: true })

      let userContentTemp = {
        watchingShows: [],
        droppedShows: [],
        willWatchShows: [],
        finishedShows: []
      }

      this.firebase.userAllShows(this.userUid).on("value", snapshot => {
        let allShows = {}
        // let allShowsLength = 0

        Object.entries(snapshot.val()).forEach(([key, value]) => {
          // allShowsLength = allShowsLength + Object.values(value).length
          allShows = {
            ...allShows,
            [key]: Object.values(value)
          }
        })

        console.log("updated userContent")
        this.setState({
          userShowsDatabases: allShows,
          loadingShows: false
        })

        // Object.entries(allShows).forEach(([key, shows]) => {
        //   let mergedShows = []

        //   shows.forEach(show => {
        //     this.firebase.showInfo(show.status, show.id).on("value", snapshot => {
        //       let userShowsTempLength = 0

        //       mergedShows = [...mergedShows, { ...show, ...snapshot.val() }]

        //       userContentTemp = {
        //         ...userContentTemp,
        //         [key]: mergedShows
        //       }

        //       Object.entries(userContentTemp).forEach(([key, value]) => {
        //         userShowsTempLength = userShowsTempLength + Object.values(value).length
        //       })

        //       if (allShowsLength === userShowsTempLength) {
        //         console.log("updated userContent")
        //         this.setState({
        //           userShowsDatabases: userContentTemp,
        //           loadingShows: false
        //         })
        //       }
        //     })
        //   })
        // })
      })

      // this.firebase.userAllShows(this.userUid).on("value", snapshot => {
      //   let allShows = {}
      //   let allShowsLength = 0

      //   Object.entries(snapshot.val()).forEach(([key, value]) => {
      //     allShowsLength = allShowsLength + Object.values(value).length
      //     allShows = {
      //       ...allShows,
      //       [key]: Object.values(value)
      //     }
      //   })

      //   Object.entries(allShows).forEach(([key, shows]) => {
      //     let mergedShows = []

      //     shows.forEach(show => {
      //       this.firebase.showInfo(show.status, show.id).on("value", snapshot => {
      //         let userShowsTempLength = 0

      //         mergedShows = [...mergedShows, { ...show, ...snapshot.val() }]

      //         userContentTemp = {
      //           ...userContentTemp,
      //           [key]: mergedShows
      //         }

      //         Object.entries(userContentTemp).forEach(([key, value]) => {
      //           userShowsTempLength = userShowsTempLength + Object.values(value).length
      //         })

      //         if (allShowsLength === userShowsTempLength) {
      //           console.log("updated userContent")
      //           this.setState({
      //             userShowsDatabases: userContentTemp,
      //             loadingShows: false
      //           })
      //         }
      //       })
      //     })
      //   })
      // })

      // let counter = 0

      // Object.keys(this.state.userShowsDatabases).forEach(database => {
      //   this.firebase.userShows(this.userUid, database).on("value", snapshot => {
      //     let shows = []
      //     snapshot.forEach(item => {
      //       shows = [...shows, item.val()]
      //     })

      //     let mergedShows = []

      //     shows.forEach(show => {
      //       this.firebase.showInfo(show.status, show.id).on("value", snapshot => {
      //         counter++

      //         mergedShows = [...mergedShows, { ...show, ...snapshot.val() }]

      //         userContentTemp = {
      //           ...userContentTemp,
      //           [database]:
      //             database === "watchingShows" ? mergedShows.filter(item => !item.finished) : mergedShows
      //         }

      //         if (counter === Object.keys(this.state.userShowsDatabases).length) {
      //           console.log("updated userContent")
      //           this.setState({
      //             userShowsDatabases: userContentTemp,
      //             loadingShows: false
      //           })
      //         }
      //       })
      //     })
      //   })
      // })
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
