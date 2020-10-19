/* eslint-disable array-callback-return */
import React, { Component } from "react"
import { Link } from "react-router-dom"
import ShowsEpisodes from "Components/Templates/SeasonsAndEpisodes/ShowsEpisodes"
import { todayDate, combineMergeObjects, releasedEpisodesToOneArray } from "Utils"
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
      initialLoading: true,
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.prevContext = this.context
    this.getContent()
  }

  componentDidUpdate() {
    if (this.prevContext.userContent !== this.context.userContent) {
      this.getContent()
    }
    this.prevContext = this.context
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  getContent = () => {
    const watchingShows = this.context.userContent.userShows.filter(
      (show) => show.database === "watchingShows" && !show.allEpisodesWatched
    )
    const toWatchEpisodes = this.context.userContent.userToWatchShows

    const watchingShowsModified = watchingShows.reduce((acc, show) => {
      if (toWatchEpisodes.find((item) => item.id === show.id)) {
        acc.push(show)
      }
      return acc
    }, [])

    if (watchingShowsModified.length === 0) {
      this.setState({ watchingShows: [] })

      if (!this.context.userContent.loadingNotFinishedShows && !this.context.userContent.loadingShows) {
        this.setState({ initialLoading: false })
      }
      return
    }

    const mergedShows = merge(watchingShowsModified, toWatchEpisodes, {
      arrayMerge: combineMergeObjects,
    })

    this.setState({ watchingShows: mergedShows, initialLoading: false })
  }

  showEpisodeInfo = (episodeId) => {
    if (this.state.detailEpisodeInfo.includes(episodeId)) {
      this.setState((prevState) => ({
        detailEpisodeInfo: [...prevState.detailEpisodeInfo.filter((item) => item !== episodeId)],
      }))
    } else {
      this.setState((prevState) => ({
        detailEpisodeInfo: [...prevState.detailEpisodeInfo, episodeId],
      }))
    }
  }

  render() {
    return (
      <div className="content-results content-results--to-watch-page">
        {this.state.initialLoading || this.context.userContent.loadingShowsMerging ? (
          <Loader className="loader--pink" />
        ) : this.state.watchingShows.length === 0 ? (
          <PlaceholderNoToWatchEpisodes />
        ) : (
          <>
            {this.state.watchingShows.map((show, index) => {
              const toWatchEpisodes = show.episodes.reduce((acc, season) => {
                const seasonEpisodes = season.episodes.reduce((acc, episode) => {
                  if (episode.air_date && new Date(episode.air_date) < todayDate.getTime()) {
                    acc.push(episode)
                  }
                  return acc
                }, [])

                seasonEpisodes.reverse()

                if (seasonEpisodes.length !== 0 && seasonEpisodes.some((item) => !item.watched)) {
                  acc.push({ ...season, episodes: seasonEpisodes })
                }

                return acc
              }, [])
              toWatchEpisodes.reverse()

              const releasedEpisodes = releasedEpisodesToOneArray({ data: toWatchEpisodes })

              return (
                <div key={show.id} className="towatch__show">
                  <Link className="towatch__show-name" to={`/show/${show.id}`}>
                    {show.name}
                  </Link>
                  <ShowsEpisodes
                    toWatchPage={true}
                    seasonsArr={toWatchEpisodes}
                    showTitle={show.name || show.original_name}
                    todayDate={todayDate}
                    id={show.id}
                    showInfo={show}
                    episodesFromDatabase={show.episodes}
                    releasedEpisodes={releasedEpisodes}
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
