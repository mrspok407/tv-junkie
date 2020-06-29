import React, { Component } from "react"
import { withUserContent } from "Components/UserContent"
import axios, { CancelToken } from "axios"
import ShowsEpisodesAuthUser from "./ShowsEpisodesAuthUser"
import ShowsEpisodesNotAuthUser from "./ShowsEpisodesNotAuthUser"
import { differenceBtwDatesInDays } from "Utils"
import Loader from "Components//Placeholders/Loader"
import classNames from "classnames"
import SeasonEpisodes from "./SeasonEpisodes"

let cancelRequest

class ShowsEpisodes extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loadingEpisodesIds: [],
      openSeasons: [],
      showEpisodes: [],
      detailEpisodeInfo: [],
      errorShowEpisodes: ""
    }
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
    const showEpisodesKey = this.props.showInDatabase.show && this.props.showInDatabase.show.showEpisodesKey

    this.props.firebase.watchingShowsAllEpisodes(this.props.authUser.uid, showEpisodesKey).off()
  }

  showSeasonsEpisode = (seasonId, seasonNum) => {
    if (this.state.openSeasons.includes(seasonId)) {
      this.setState(prevState => ({
        openSeasons: [...prevState.openSeasons.filter(item => item !== seasonId)]
      }))
    } else {
      this.setState(prevState => ({
        openSeasons: [...prevState.openSeasons, seasonId]
      }))
    }

    if (this.state.showEpisodes.some(item => item.seasonId === seasonId)) return

    this.setState(prevState => ({
      loadingEpisodesIds: [...prevState.loadingEpisodesIds, seasonId]
    }))

    axios
      .get(
        `https://api.themoviedb.org/3/tv/${this.props.id}/season/${seasonNum}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
      .then(({ data: { episodes } }) => {
        if (!this._isMounted) return

        const episodesReverse = episodes.reverse()

        this.setState(prevState => ({
          showEpisodes: [...prevState.showEpisodes, { seasonId, episodes: episodesReverse }],
          loadingEpisodesIds: [...prevState.loadingEpisodesIds.filter(item => item !== seasonId)],
          errorShowEpisodes: ""
        }))
      })
      .catch(err => {
        if (axios.isCancel(err) || !this._isMounted) return
        this.setState({
          loadingEpisodesIds: [],
          errorShowEpisodes: "Something went wrong, sorry"
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

  // showSeasonsEpisodeAuthUser = seasonId => {
  //   if (this.state.openSeasons.includes(seasonId)) {
  //     this.setState(prevState => ({
  //       openSeasons: [...prevState.openSeasons.filter(item => item !== seasonId)]
  //     }))
  //   } else {
  //     this.setState(prevState => ({
  //       openSeasons: [...prevState.openSeasons, seasonId]
  //     }))
  //   }
  // }

  toggleWatchedEpisode = (seasonNum, episodeNum) => {
    if (!this.props.authUser) return

    const show = this.props.showInDatabase.show

    this.props.firebase
      .watchingShowsEpisode(this.props.authUser.uid, show.showEpisodesKey, seasonNum, episodeNum)
      .update({
        watched: !this.props.showEpisodesDatabase[seasonNum - 1].episodes[episodeNum - 1].watched
      })
  }

  checkEverySeasonEpisode = seasonNum => {
    const show = this.props.showInDatabase.show || {}
    const seasonEpisodes = this.props.showEpisodesDatabase[seasonNum - 1].episodes
    const isAllEpisodesChecked = !this.props.showEpisodesDatabase[seasonNum - 1].episodes.some(
      item => item.watched === false
    )

    seasonEpisodes.forEach(episode => {
      episode.watched = !isAllEpisodesChecked
    })

    this.props.firebase
      .watchingShowsAllSeasonEpisodes(this.props.authUser.uid, show.showEpisodesKey, seasonNum)
      .set(seasonEpisodes)
  }

  checkEveryShowEpisode = () => {
    const show = this.props.showInDatabase.show || {}
    const allEpisodes = this.props.showEpisodesDatabase
    let isAllEpisodesChecked

    allEpisodes.forEach(item => (isAllEpisodesChecked = !item.episodes.some(item => item.watched === false)))

    allEpisodes.forEach(season => {
      season.episodes.forEach(episode => {
        episode.watched = !isAllEpisodesChecked
      })
    })

    this.props.firebase
      .watchingShowsAllEpisodes(this.props.authUser.uid, show.showEpisodesKey)
      .set(allEpisodes)
  }

  render() {
    return (
      <>
        <div className="full-detailes__seasons-and-episodes">
          {this.props.seasonsArr.map(season => {
            if (season.season_number === 0 || season.name === "Specials" || !season.air_date) return null
            const seasonId = season.id

            const daysToNewSeason = differenceBtwDatesInDays(season.air_date, this.props.todayDate)

            return (
              <div
                key={seasonId}
                className={classNames("full-detailes__season", {
                  "full-detailes__season--no-poster": !season.poster_path
                })}
                style={
                  !this.state.loadingEpisodesIds.includes(seasonId) ? { rowGap: "10px" } : { rowGap: "0px" }
                }
              >
                <div
                  className={classNames("full-detailes__season-info", {
                    "full-detailes__season-info--open": this.state.openSeasons.includes(seasonId)
                  })}
                  style={
                    daysToNewSeason > 0
                      ? {
                          backgroundColor: "rgba(132, 90, 90, 0.3)"
                        }
                      : {
                          backgroundColor: "#1d1d1d96"
                        }
                  }
                  onClick={() => this.showSeasonsEpisode(seasonId, season.season_number)}
                >
                  <div className="full-detailes__season-number">
                    Season {season.season_number}
                    {daysToNewSeason > 0 && (
                      <span className="full-detailes__season-when-new-season">
                        {daysToNewSeason} days to air
                      </span>
                    )}
                  </div>
                  <div className="full-detailes__season-date">
                    {season.air_date && season.air_date.slice(0, 4)}
                  </div>
                </div>

                {this.state.openSeasons.includes(seasonId) &&
                  (!this.state.loadingEpisodesIds.includes(seasonId) ? (
                    <>
                      {/* {season.poster_path && (
                        <div
                          className="full-detailes__season-poster"
                          style={{
                            backgroundImage: `url(https://image.tmdb.org/t/p/w500/${season.poster_path})`
                          }}
                        />
                      )} */}
                      {season.poster_path && (
                        <div className="full-detailes__season-poster-wrapper">
                          <div
                            className="full-detailes__season-poster"
                            style={{
                              backgroundImage: `url(https://image.tmdb.org/t/p/w500/${season.poster_path})`
                            }}
                          />
                          <div className="full-detailes__check-everything">
                            <button
                              type="button"
                              className="button"
                              onClick={() => this.checkEverySeasonEpisode(season.season_number)}
                            >
                              Check everything
                            </button>
                            <button
                              type="button"
                              className="button"
                              onClick={() => this.checkEveryShowEpisode()}
                            >
                              Check all
                            </button>
                          </div>
                        </div>
                      )}
                      <SeasonEpisodes
                        showEpisodes={this.state.showEpisodes}
                        showTitle={this.props.showTitle}
                        todayDate={this.props.todayDate}
                        detailEpisodeInfo={this.state.detailEpisodeInfo}
                        showEpisodeInfo={this.showEpisodeInfo}
                        season={season}
                        seasonId={seasonId}
                        authUser={this.props.authUser}
                        showInDatabase={this.props.showInDatabase.show}
                        showEpisodesDatabase={this.props.showEpisodesDatabase}
                        toggleWatchedEpisode={this.toggleWatchedEpisode}
                      />
                    </>
                  ) : !this.state.errorShowEpisodes ? (
                    <Loader className="loader--small-pink" />
                  ) : (
                    <div>{this.state.errorShowEpisodes}</div>
                  ))}
              </div>
            )
          })}
        </div>
        {/* {this.props.showInDatabase.show ? (
          <ShowsEpisodesAuthUser
            openSeasons={this.state.openSeasons}
            detailEpisodeInfo={this.state.detailEpisodeInfo}
            showEpisodeInfo={this.showEpisodeInfo}
            toggleWatchedEpisode={this.toggleWatchedEpisode}
            checkEverySeasonEpisode={this.checkEverySeasonEpisode}
            checkEveryShowEpisode={this.checkEveryShowEpisode}
            showSeasonsEpisodeAuthUser={this.showSeasonsEpisodeAuthUser}
            showEpisodes={this.state.showEpisodes}
            showInDb={this.props.showInDatabase.show}
            seasonsArr={this.props.seasonsArr}
            showTitle={this.props.showTitle}
            todayDate={this.props.todayDate}
            id={this.props.id}
          />
        ) : (
          <ShowsEpisodesNotAuthUser
            openSeasons={this.state.openSeasons}
            detailEpisodeInfo={this.state.detailEpisodeInfo}
            loadingEpisodesIds={this.state.loadingEpisodesIds}
            showEpisodes={this.state.showEpisodes}
            errorShowEpisodes={this.state.errorShowEpisodes}
            showEpisodeInfo={this.showEpisodeInfo}
            showSeasonsEpisode={this.showSeasonsEpisode}
            seasonsArr={this.props.seasonsArr}
            showTitle={this.props.showTitle}
            todayDate={this.props.todayDate}
            id={this.props.id}
          />
        )} */}
      </>
    )
  }
}

export default withUserContent(ShowsEpisodes, "ShowsEpisodes")
