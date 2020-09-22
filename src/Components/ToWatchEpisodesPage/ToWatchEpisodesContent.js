/* eslint-disable array-callback-return */
import React, { Component } from "react"
import { Link } from "react-router-dom"
import ShowsEpisodes from "Components/Templates/SeasonsAndEpisodes/ShowsEpisodes"
import { todayDate, combineMergeObjects } from "Utils"
import Loader from "Components/Placeholders/Loader"
import PlaceholderNoToWatchEpisodes from "Components/Placeholders/PlaceholderNoToWatchEpisodes"
import merge from "deepmerge"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { withUserContent } from "Components/UserContent"

class ToWatchEpisodesContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      watchingShows: [],
      initialLoading: true
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.prevContext = this.context
    // this.getContent({})
    this.getContentNew()
  }

  componentDidUpdate() {
    if (this.prevContext.userContent !== this.context.userContent) {
      this.getContentNew()
    }
    this.prevContext = this.context
  }

  componentWillUnmount() {
    this.state.watchingShows.forEach(show => {
      this.props.firebase
        .userShow({ uid: this.props.authUser.uid, key: show.id, database: "watchingShows" })
        .off()
    })

    const watchingShows = this.context.userContent.userShows.filter(
      show => show.database === "watchingShows" && !show.allEpisodesWatched
    )

    watchingShows.forEach(show => {
      this.props.firebase.userShowAllEpisodes(this.props.authUser.uid, show.id).off()
    })

    this._isMounted = false
  }

  getContentNew = () => {
    const watchingShows = this.context.userContent.userShows.filter(
      show => show.database === "watchingShows" && !show.allEpisodesWatched
    )

    if (watchingShows.length === 0) return

    const updatedShows = Promise.all(
      watchingShows.map(show => {
        return this.props.firebase
          .userShowAllEpisodes(this.props.authUser.uid, show.id)
          .once("value")
          .then(snapshot => {
            const mergedEpisodes = merge(show.episodes, snapshot.val(), {
              arrayMerge: combineMergeObjects
            })
            const updatedShow = { ...show, episodes: mergedEpisodes }
            return updatedShow
          })
      })
    )

    updatedShows.then(data => {
      this.setState({
        watchingShows: data,
        initialLoading: false
      })
    })
  }

  getContent = ({ sortBy = "firstAirDate", isInitialLoad = true }) => {
    if (this.props.authUser === null) return
    if (isInitialLoad) {
      this.setState({ initialLoading: true })
    }

    this.props.firebase
      .userAllShows(this.props.authUser.uid)
      .orderByChild(sortBy)
      .once("value", snapshot => {
        let userShows = []
        snapshot.forEach(item => {
          // if (item.val().allEpisodesWatched) return

          userShows = [
            ...userShows,
            {
              id: item.val().id,
              // name: item.val().name,
              status: item.val().status,
              timeStamp: item.val().timeStamp,
              allEpisodesWatched: item.val().allEpisodesWatched,
              // finished_and_timeStamp: item.val().finished_and_timeStamp,
              episodes: item.val().episodes
            }
          ]

          this.props.firebase
            .userShow({ uid: this.props.authUser.uid, key: item.val().id })
            .once("value", snapshot => {
              if (snapshot.val() !== null) {
                const index = this.state.watchingShows.findIndex(item => item.id === snapshot.val().id)
                const watchingShows = this.state.watchingShows.filter(item => item.id !== snapshot.val().id)
                const show = this.state.watchingShows.find(item => item.id === snapshot.val().id)

                //  const showsSubDatabase = snapshot.val().status

                if (show) {
                  show.episodes.forEach((season, seasonIndex) => {
                    season.episodes.forEach((episode, episodeIndex) => {
                      show.episodes[seasonIndex].episodes[episodeIndex] = {
                        ...episode,
                        watched: snapshot.val().episodes[seasonIndex].episodes[episodeIndex].watched
                      }
                    })
                  })
                  show.info = {
                    ...show.info,
                    timeStamp: snapshot.val().timeStamp
                  }
                  show.allEpisodesWatched = snapshot.val().allEpisodesWatched

                  watchingShows.splice(index, 0, show)

                  this.setState({
                    watchingShows: watchingShows
                  })
                }

                // if (snapshot.val().allEpisodesWatched && showsSubDatabase === "ended") {
                //   this.props.firebase
                //     .userShows(this.props.authUser.uid, "finishedShows")
                //     .child(snapshot.val().id)
                //     .set({
                //       // timeStamp: snapshot.val().timeStamp,
                //       // firstAirDate: snapshot.val().firstAirDate,
                //       id: snapshot.val().id,
                //       // name: snapshot.val().name,
                //       status: snapshot.val().status,
                //       finished_and_name: snapshot.val().finished_and_name,
                //       // timeStamp: snapshot.val().timeStamp,
                //       finished_and_timeStamp: snapshot.val().finished_and_timeStamp
                //     })
                // } else {
                //   this.props.firebase
                //     .userShows(this.props.authUser.uid, "finishedShows")
                //     .child(snapshot.val().id)
                //     .set(null)
                // }
              }
            })
        })

        Promise.all(
          userShows.map(show => {
            const showsSubDatabase = show.status

            return this.props.firebase
              .showInDatabase(showsSubDatabase, show.id)
              .once("value")
              .then(snapshot => {
                return snapshot.val()
              })
          })
        ).then(showsData => {
          if (!this._isMounted) return

          const updatedShows = []

          showsData.forEach(show => {
            const userShow = userShows.find(item => item.id === show.id)
            if (userShow.allEpisodesWatched) return

            let updatedSeasons = []
            let updatedSeasonsUser = []

            show.episodes.forEach((season, indexSeason) => {
              let updatedEpisodesUser = []
              const seasonPath = userShows.find(item => item.id === show.id).episodes[indexSeason]
              const databaseEpisodes = season.episodes
              const userEpisodes = seasonPath
                ? userShows.find(item => item.id === show.id).episodes[indexSeason].episodes
                : []

              const mergedEpisodes = merge(databaseEpisodes, userEpisodes, {
                arrayMerge: combineMergeObjects
              })

              mergedEpisodes.forEach(episode => {
                const updatedEpisode = {
                  watched: episode.watched || false,
                  userRating: episode.userRating || 0
                }
                updatedEpisodesUser.push(updatedEpisode)
              })

              const updatedSeason = {
                ...season,
                episodes: mergedEpisodes
              }

              const updatedSeasonUser = {
                season_number: season.season_number,
                episodes: updatedEpisodesUser,
                userRating: (seasonPath && seasonPath.userRating) || 0
              }

              updatedSeasons.push(updatedSeason)
              updatedSeasonsUser.push(updatedSeasonUser)
            })

            updatedShows.push({
              ...show,
              allEpisodesWatched: userShow.allEpisodesWatched,
              info: {
                ...show.info,
                timeStamp: userShow.timeStamp
              },
              episodes: updatedSeasons
            })

            this.props.firebase.userShowAllEpisodes(this.props.authUser.uid, show.id).set(updatedSeasonsUser)
          })

          this.setState({
            watchingShows: updatedShows.reverse(),
            initialLoading: false
          })
        })
      })
  }

  showEpisodeInfo = episodeId => {
    if (this.state.detailEpisodeInfo.includes(episodeId)) {
      this.setState(prevState => ({
        detailEpisodeInfo: [...prevState.detailEpisodeInfo.filter(item => item !== episodeId)]
      }))
    } else {
      this.setState(prevState => ({
        detailEpisodeInfo: [...prevState.detailEpisodeInfo, episodeId]
      }))
    }
  }

  render() {
    return (
      <div className="content-results content-results--to-watch-page">
        {this.state.initialLoading ? (
          <Loader className="loader--pink" />
        ) : this.state.watchingShows.length === 0 ? (
          <PlaceholderNoToWatchEpisodes />
        ) : (
          <>
            {this.state.watchingShows.map(show => {
              const showsSubDatabase =
                show.status === "Ended" || show.status === "Canceled" ? "ended" : "ongoing"

              const showInDatabase = {
                info: {
                  ...show,
                  status: showsSubDatabase,
                  episodes: show.episodes
                }
              }

              const infoToPass = show && {
                id: show.id,
                status: show.status
              }

              let newEpisodes = []

              show.episodes.forEach(season => {
                let newSeason = {}
                let episodes = []

                season.episodes.forEach(episode => {
                  if (episode.air_date && new Date(episode.air_date) < todayDate.getTime()) {
                    episodes.push(episode)
                  }
                })

                episodes.reverse()

                newSeason = {
                  ...season,
                  episodes
                }

                if (newSeason.episodes.length !== 0 && newSeason.episodes.some(item => !item.watched)) {
                  newEpisodes = [...newEpisodes, newSeason]
                }
              })

              newEpisodes.reverse()

              if (newEpisodes.length === 0) return

              return (
                <div key={show.id} className="towatch__show">
                  <Link className="towatch__show-name" to={`/show/${show.id}`}>
                    {show.name}
                  </Link>
                  <ShowsEpisodes
                    toWatchPage={true}
                    seasonsArr={newEpisodes}
                    showTitle={show.name || show.original_name}
                    todayDate={todayDate}
                    id={show.id}
                    showInDatabase={showInDatabase}
                    infoToPass={infoToPass}
                  />
                </div>
              )
            })}
          </>
        )}
      </div>
    )
  }
}

export default withUserContent(ToWatchEpisodesContent)

ToWatchEpisodesContent.contextType = AppContext
