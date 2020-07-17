import React, { Component } from "react"
import { withUserContent } from "Components/UserContent"
import axios, { CancelToken } from "axios"
import { differenceBtwDatesInDays } from "Utils"
import { checkIfAllEpisodesWatched } from "Components/UserContent/FirebaseHelpers"
import Loader from "Components/Placeholders/Loader"
import classNames from "classnames"
import SeasonEpisodes from "./SeasonEpisodes"
import "./ShowsEpisodes.scss"

let cancelRequest

class ShowsEpisodes extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loadingEpisodesIds: [],
      openSeasons: [],
      showEpisodes: [],
      detailEpisodeInfo: [],
      releasedSeasonEpisodes: {},
      allEpisodesFromDatabase: [],
      errorShowEpisodes: ""
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.initialFirstSeasonLoad()
    this.getAllEpisodesFromDatabase()
  }

  componentDidUpdate(prevProps) {
    if (this.props.showInDatabase.info !== prevProps.showInDatabase.info) {
      this.getAllEpisodesFromDatabase()
    }
  }

  componentWillUnmount() {
    this._isMounted = false
    if (cancelRequest !== undefined) {
      cancelRequest()
    }

    this.props.firebase
      .userShowAllEpisodes(this.props.authUser.uid, this.props.id, this.props.showInDatabase.database)
      .off()
  }

  initialFirstSeasonLoad = () => {
    // const firstSeason = this.props.seasonsArr.find(item => item.season_number === 1)
    if (this.props.seasonsArr.length === 0) return

    const firstSeason = this.props.seasonsArr[this.props.seasonsArr.length - 1]

    this.setState({
      openSeasons: firstSeason && [firstSeason.id]
    })

    axios
      .get(
        `https://api.themoviedb.org/3/tv/${this.props.id}/season/${firstSeason.season_number}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`,
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
          showEpisodes: [
            ...prevState.showEpisodes,
            {
              seasonId: firstSeason.id,
              episodes: episodesReverse
            }
          ],
          loadingEpisodesIds: [...prevState.loadingEpisodesIds.filter(item => item !== firstSeason.id)],
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

  showSeasonsEpisode = (seasonId, seasonNum) => {
    if (this.state.openSeasons.includes(seasonId)) {
      this.setState(prevState => ({
        openSeasons: [...prevState.openSeasons.filter(item => item !== seasonId)]
      }))
    } else {
      this.setState({
        openSeasons: [...this.state.openSeasons, seasonId]
      })
    }

    if (this.props.toWatchPage) return
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

  toggleWatchedEpisode = (seasonNum, episodeNum) => {
    if (!this.props.authUser) return

    const show = this.props.showInDatabase

    console.log(show)

    this.props.firebase
      .userShowSingleEpisode(this.props.authUser.uid, show.info.id, show.database, seasonNum, episodeNum)
      .update(
        {
          watched: !show.info.episodes[seasonNum - 1].episodes[episodeNum - 1].watched
        },
        checkIfAllEpisodesWatched({
          show,
          firebase: this.props.firebase,
          authUser: this.props.authUser,
          todayDate: this.props.todayDate
        })
      )
  }

  checkEverySeasonEpisode = seasonNum => {
    const show = this.props.showInDatabase
    const seasonEpisodes = show.info.episodes[seasonNum - 1].episodes
    const seasonEpisodesFromDatabase = this.state.allEpisodesFromDatabase.filter(
      item => item.season_number === seasonNum
    )
    let isAllEpisodesChecked = true

    seasonEpisodesFromDatabase.forEach(item => {
      if (!seasonEpisodes[item.episode_number - 1].watched) {
        isAllEpisodesChecked = false
      }
    })

    seasonEpisodesFromDatabase.forEach(item => {
      seasonEpisodes[item.episode_number - 1].watched = !isAllEpisodesChecked
    })

    this.props.firebase.userShowSeason(this.props.authUser.uid, show.info.id, show.database, seasonNum).set(
      seasonEpisodes,
      checkIfAllEpisodesWatched({
        show,
        firebase: this.props.firebase,
        authUser: this.props.authUser,
        todayDate: this.props.todayDate
      })
    )
  }

  getAllEpisodesFromDatabase = () => {
    const show = this.props.infoToPass
    const allShowsListSubDatabase =
      show.status === "Ended" || show.status === "Canceled" ? "ended" : "ongoing"

    this.props.firebase.showEpisodes(allShowsListSubDatabase, show.id).once("value", snapshot => {
      if (snapshot.val() !== null) {
        let allEpisodes = []

        snapshot.val().forEach(item => {
          allEpisodes = [...allEpisodes, ...item.episodes]
        })

        const releasedEpisodes = allEpisodes.filter(episode => {
          const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, this.props.todayDate)
          return daysToNewEpisode < 0 && episode
        })

        this.setState({
          allEpisodesFromDatabase: releasedEpisodes
        })
      }
    })
  }

  checkEveryShowEpisode = () => {
    const show = this.props.showInDatabase
    const allEpisodesUser = show.info.episodes
    let allEpisodesDatabase = []
    let isAllEpisodesChecked = true

    show.info.episodes.forEach(item => {
      allEpisodesDatabase = [...allEpisodesDatabase, ...item.episodes]
    })

    console.log(this.state.allEpisodesFromDatabase)

    this.state.allEpisodesFromDatabase.forEach(item => {
      if (!allEpisodesDatabase[item.episode_number - 1].watched) {
        isAllEpisodesChecked = false
      }
    })

    this.state.allEpisodesFromDatabase.forEach(item => {
      allEpisodesUser[item.season_number - 1].episodes[
        item.episode_number - 1
      ].watched = !isAllEpisodesChecked
    })

    this.props.firebase.userShowAllEpisodes(this.props.authUser.uid, show.info.id, show.database).set(
      allEpisodesUser,
      checkIfAllEpisodesWatched({
        show,
        firebase: this.props.firebase,
        authUser: this.props.authUser,
        todayDate: this.props.todayDate
      })
    )
  }

  render() {
    const showCheckboxes =
      this.props.authUser &&
      this.props.showInDatabase.info &&
      this.props.showInDatabase.database !== "notWatchingShows"

    return (
      <>
        {showCheckboxes && this.props.fullContentPage && (
          <div className="show-episodes__check-all-episodes">
            <button type="button" className="button" onClick={() => this.checkEveryShowEpisode()}>
              Check all episodes
            </button>
          </div>
        )}
        <div
          className={classNames("show-episodes", {
            "show-episodes--to-watch-page": this.props.toWatchPage
          })}
        >
          {this.props.seasonsArr.map(season => {
            if (season.season_number === 0 || season.name === "Specials" || !season.air_date) return null

            const seasonId = season.id

            const daysToNewSeason = differenceBtwDatesInDays(season.air_date, this.props.todayDate)

            const episodeToString =
              this.props.toWatchPage && season.episodes[season.episodes.length - 1].episode_number.toString()
            const episodeNumber =
              episodeToString && episodeToString.length === 1
                ? "e0".concat(episodeToString)
                : "e".concat(episodeToString)

            return (
              <div
                key={seasonId}
                className={classNames("show-episodes__season", {
                  "show-episodes__season--no-poster": !season.poster_path
                })}
                style={
                  !this.state.loadingEpisodesIds.includes(seasonId) ? { rowGap: "10px" } : { rowGap: "0px" }
                }
              >
                <div
                  className={classNames("show-episodes__season-info", {
                    "show-episodes__season-info--open": this.state.openSeasons.includes(seasonId)
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
                  <div
                    className={classNames("show-episodes__season-number", {
                      "show-episodes__season-number--to-watch-page": this.props.toWatchPage
                    })}
                  >
                    Season {season.season_number}
                    {daysToNewSeason > 0 && (
                      <span className="show-episodes__season-days-to-air">{daysToNewSeason} days to air</span>
                    )}
                  </div>

                  {this.props.toWatchPage && (
                    <div className="show-episodes__season-episodes-left">
                      {season.episodes.length} episodes left from {episodeNumber}
                    </div>
                  )}

                  <div
                    className={classNames("show-episodes__season-date", {
                      "show-episodes__season-date--to-watch-page": this.props.toWatchPage
                    })}
                  >
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
                      {season.poster_path && this.props.fullContentPage && (
                        <div className="show-episodes__season-poster-wrapper">
                          <div
                            className="show-episodes__season-poster"
                            style={{
                              backgroundImage: `url(https://image.tmdb.org/t/p/w500/${season.poster_path})`
                            }}
                          />
                          {showCheckboxes && daysToNewSeason < 0 && (
                            <div className="show-episodes__season-check-all-episodes">
                              <button
                                type="button"
                                className="button"
                                onClick={() => this.checkEverySeasonEpisode(season.season_number)}
                              >
                                Check all
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <SeasonEpisodes
                        fullContentPage={this.props.fullContentPage}
                        seasonsArr={this.props.seasonsArr}
                        showEpisodes={this.state.showEpisodes}
                        toWatchPage={this.props.toWatchPage}
                        showTitle={this.props.showTitle}
                        todayDate={this.props.todayDate}
                        detailEpisodeInfo={this.state.detailEpisodeInfo}
                        showEpisodeInfo={this.showEpisodeInfo}
                        season={season}
                        seasonId={seasonId}
                        authUser={this.props.authUser}
                        showInDatabase={this.props.showInDatabase}
                        toggleWatchedEpisode={this.toggleWatchedEpisode}
                        loadingFromDatabase={this.props.loadingFromDatabase}
                      />
                      {this.props.toWatchPage && (
                        <div
                          className={classNames("show-episodes__season-check-all-episodes", {
                            "show-episodes__season-check-all-episodes--to-watch-page": this.props.toWatchPage
                          })}
                        >
                          <button
                            type="button"
                            className="button"
                            onClick={() => this.checkEverySeasonEpisode(season.season_number)}
                          >
                            Check all
                          </button>
                        </div>
                      )}
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
      </>
    )
  }
}

export default withUserContent(ShowsEpisodes, "ShowsEpisodes")
