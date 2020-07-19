import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import ShowsEpisodes from "Components/Templates/SeasonsAndEpisodes/ShowsEpisodes"
import { todayDate } from "Utils"
import Loader from "Components/Placeholders/Loader"
import PlaceholderNoToWatchEpisodes from "Components/Placeholders/PlaceholderNoToWatchEpisodes"
import merge from "deepmerge"

class ToWatchEpisodesContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      watchingShows: [],
      initialLoading: true
    }
  }

  componentDidMount() {
    this.getContent({})
  }

  componentWillUnmount() {
    this.state.watchingShows.forEach(show => {
      this.props.firebase.userShow(this.props.authUser.uid, show.id, "watchingShows").off()
    })
  }

  combineMerge = (target, source, options) => {
    const destination = target.slice()

    source.forEach((item, index) => {
      if (typeof destination[index] === "undefined") {
        destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
      } else if (options.isMergeableObject(item)) {
        destination[index] = merge(target[index], item, options)
      } else if (target.indexOf(item) === -1) {
        destination.push(item)
      }
    })
    return destination
  }

  getContent = ({ sortBy = "first_air_date", isInitialLoad = true, database = "watchingShows" }) => {
    if (this.props.authUser === null) return
    if (isInitialLoad) {
      this.setState({ initialLoading: true })
    }

    this.props.firebase
      .userShows(this.props.authUser.uid, database)
      .orderByChild(sortBy)
      .once("value", snapshot => {
        let userShows = []
        snapshot.forEach(item => {
          userShows = [
            ...userShows,
            {
              id: item.val().id,
              name: item.val().name,
              status: item.val().status,
              timeStamp: item.val().timeStamp,
              episodes: item.val().episodes
            }
          ]

          this.props.firebase
            .userShow(this.props.authUser.uid, item.val().id, database)
            .on("value", snapshot => {
              if (snapshot.val() !== null) {
                const index = this.state.watchingShows.findIndex(item => item.id === snapshot.val().id)
                const watchingShows = this.state.watchingShows.filter(item => item.id !== snapshot.val().id)
                const show = this.state.watchingShows.find(item => item.id === snapshot.val().id)

                const allShowsListSubDatabase =
                  snapshot.val().status === "Ended" || snapshot.val().status === "Canceled"
                    ? "ended"
                    : "ongoing"

                if (show) {
                  show.episodes.forEach((season, seasonIndex) => {
                    season.episodes.forEach((episode, episodeIndex) => {
                      show.episodes[seasonIndex].episodes[episodeIndex] = {
                        ...episode,
                        watched: snapshot.val().episodes[seasonIndex].episodes[episodeIndex].watched
                      }
                    })
                  })
                  watchingShows.splice(index, 0, show)

                  this.setState({
                    watchingShows: watchingShows
                  })
                }

                if (snapshot.val().allEpisodesWatched && allShowsListSubDatabase === "ended") {
                  this.props.firebase
                    .userShows(this.props.authUser.uid, "finishedShows")
                    .child(snapshot.val().id)
                    .set({
                      timeStamp: snapshot.val().timeStamp,
                      firstAirDate: snapshot.val().firstAirDate,
                      id: snapshot.val().id,
                      name: snapshot.val().name,
                      status: snapshot.val().status
                    })
                } else {
                  this.props.firebase
                    .userShows(this.props.authUser.uid, "finishedShows")
                    .child(snapshot.val().id)
                    .set(null)
                }
              }
            })
        })

        Promise.all(
          userShows.map(item => {
            const allShowsListSubDatabase =
              item.status === "Ended" || item.status === "Canceled" ? "ended" : "ongoing"

            return this.props.firebase
              .showInDatabase(allShowsListSubDatabase, item.id)
              .once("value")
              .then(snapshot => {
                return snapshot.val()
              })
          })
        ).then(showsData => {
          const updatedShows = []

          showsData.forEach(show => {
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
                arrayMerge: this.combineMerge
              })

              mergedEpisodes.forEach(episode => {
                const updatedEpisode = {
                  watched: episode.watched || false
                }
                updatedEpisodesUser.push(updatedEpisode)
              })

              const updatedSeason = {
                ...season,
                episodes: mergedEpisodes
              }

              const updatedSeasonUser = {
                season_number: season.season_number,
                episodes: updatedEpisodesUser
              }

              updatedSeasons.push(updatedSeason)
              updatedSeasonsUser.push(updatedSeasonUser)
            })

            updatedShows.push({
              ...show,
              episodes: updatedSeasons
            })

            this.props.firebase
              .userShowAllEpisodes(this.props.authUser.uid, show.id, database)
              .set(updatedSeasonsUser)
          })

          this.setState({
            watchingShows: updatedShows.reverse(),
            initialLoading: false
          })
        })
      })
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
              const showInDatabase = show && {
                database: "watchingShows",
                info: {
                  ...show.info,
                  episodes: show.episodes
                }
              }

              const infoToPass = show && {
                id: show.info.id,
                status: show.info.status
              }

              let newEpisodes = []

              show.episodes.forEach(season => {
                let newSeason = {}
                let episodes = []

                season.episodes.forEach(episode => {
                  if (
                    !episode.watched &&
                    episode.air_date &&
                    new Date(episode.air_date) < todayDate.getTime()
                  ) {
                    episodes.push(episode)
                  }
                })

                episodes.reverse()

                newSeason = {
                  ...season,
                  episodes
                }

                if (newSeason.episodes.length !== 0) {
                  newEpisodes = [...newEpisodes, newSeason]
                }
              })

              newEpisodes.reverse()

              if (newEpisodes.length === 0) return

              return (
                <div key={show.id} className="towatch__show">
                  <Link className="towatch__show-name" to={`/show/${show.info.id}`}>
                    {show.info.name}
                  </Link>
                  <ShowsEpisodes
                    toWatchPage={true}
                    seasonsArr={newEpisodes}
                    showTitle={show.info.name || show.info.original_name}
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
