import React, { Component } from "react"
import { withUserContent } from "Components/UserContent"
import axios, { CancelToken } from "axios"
import { differenceBtwDatesInDays, todayDate } from "Utils"
import isAllEpisodesWatched from "./FirebaseHelpers/isAllEpisodesWatched"
import Loader from "Components/Placeholders/Loader"
import classNames from "classnames"
import SeasonEpisodes from "./SeasonEpisodes"
import "../../../styles/abstractions/listOfEpisodes.scss"
import UserRating from "../../UserRating/UserRating"
import { AppContext } from "Components/AppContext/AppContextHOC"

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
      errorShowEpisodes: "",
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.initialFirstSeasonLoad()
  }

  componentWillUnmount() {
    this._isMounted = false
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
  }

  initialFirstSeasonLoad = () => {
    const seasons = this.props.seasonsArr.filter((item) => item.name !== "Specials")
    if (seasons.length === 0) return

    const firstSeason = seasons[seasons.length - 1]

    this.setState({
      openSeasons: firstSeason && [firstSeason.id],
    })

    if (this.props.toWatchPage) {
      this.setState({
        showEpisodes: [{ seasonId: firstSeason.id, episodes: firstSeason.episodes }],
      })
    } else {
      axios
        .get(
          `https://api.themoviedb.org/3/tv/${this.props.id}/season/${firstSeason.season_number}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`,
          {
            cancelToken: new CancelToken(function executor(c) {
              cancelRequest = c
            }),
          }
        )
        .then(({ data: { episodes } }) => {
          if (!this._isMounted) return

          const episodesReverse = episodes.reverse()

          this.setState((prevState) => ({
            showEpisodes: [
              ...prevState.showEpisodes,
              {
                seasonId: firstSeason.id,
                episodes: episodesReverse,
              },
            ],
            loadingEpisodesIds: [...prevState.loadingEpisodesIds.filter((item) => item !== firstSeason.id)],
            errorShowEpisodes: "",
          }))
        })
        .catch((err) => {
          if (axios.isCancel(err) || !this._isMounted) return
          this.setState({
            loadingEpisodesIds: [],
            errorShowEpisodes: "Something went wrong, sorry",
          })
        })
    }
  }

  showSeasonsEpisodes = (seasonId, seasonNum) => {
    if (this.state.openSeasons.includes(seasonId)) {
      this.setState((prevState) => ({
        openSeasons: [...prevState.openSeasons.filter((item) => item !== seasonId)],
      }))
    } else {
      this.setState({
        openSeasons: [...this.state.openSeasons, seasonId],
      })
    }

    if (this.props.toWatchPage) return
    if (this.state.showEpisodes.some((item) => item.seasonId === seasonId)) return

    this.setState((prevState) => ({
      loadingEpisodesIds: [...prevState.loadingEpisodesIds, seasonId],
    }))

    axios
      .get(
        `https://api.themoviedb.org/3/tv/${this.props.id}/season/${seasonNum}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          }),
        }
      )
      .then(({ data: { episodes } }) => {
        if (!this._isMounted) return

        const episodesReverse = episodes.reverse()

        this.setState((prevState) => ({
          showEpisodes: [...prevState.showEpisodes, { seasonId, episodes: episodesReverse }],
          loadingEpisodesIds: [...prevState.loadingEpisodesIds.filter((item) => item !== seasonId)],
          errorShowEpisodes: "",
        }))
      })
      .catch((err) => {
        if (axios.isCancel(err) || !this._isMounted) return
        this.setState({
          loadingEpisodesIds: [],
          errorShowEpisodes: "Something went wrong, sorry",
        })
      })
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

  toggleWatchedEpisode = (seasonNum, episodeNum) => {
    if (!this.props.authUser) return

    const showInfo = this.props.showInfo
    const episodesFromDatabase = this.props.episodesFromDatabase
    const releasedEpisodes = this.props.releasedEpisodes

    this.props.firebase
      .userShowSingleEpisode({
        uid: this.props.authUser.uid,
        key: showInfo.id,
        seasonNum,
        episodeNum,
      })
      .update({
        watched: !episodesFromDatabase[seasonNum - 1].episodes[episodeNum].watched,
      })

    if (this.props.toWatchPage) {
      this.props.firebase
        .userShowSingleEpisodeNotFinished({
          uid: this.props.authUser.uid,
          key: showInfo.id,
          seasonNum,
          episodeNum,
        })
        .update(
          {
            watched: !episodesFromDatabase[seasonNum - 1].episodes[episodeNum].watched,
          },
          () => {
            isAllEpisodesWatched({
              showInfo,
              releasedEpisodes,
              authUser: this.props.authUser,
              firebase: this.props.firebase,
              singleEpisode: true,
            })
          }
        )
    }
  }

  checkEverySeasonEpisode = (seasonNum) => {
    const showInfo = this.props.showInfo
    const episodesFromDatabase = this.props.episodesFromDatabase
    const releasedEpisodes = this.props.releasedEpisodes

    const seasonEpisodes = episodesFromDatabase[seasonNum - 1].episodes.reduce((acc, episode) => {
      acc.push({ userRating: episode.userRating, watched: episode.watched })
      return acc
    }, [])
    const seasonEpisodesAirDate = episodesFromDatabase[seasonNum - 1].episodes.reduce((acc, episode) => {
      acc.push({
        userRating: episode.userRating,
        watched: episode.watched,
        air_date: episode.air_date || null,
      })
      return acc
    }, [])

    const seasonEpisodesFromDatabase = releasedEpisodes.filter((item) => item.season_number === seasonNum)
    const seasonLength = seasonEpisodesFromDatabase.length

    let isAllEpisodesChecked = true

    seasonEpisodesFromDatabase.forEach((episode, episodeIndex) => {
      const indexOfEpisode = seasonLength - 1 - episodeIndex
      if (!seasonEpisodes[indexOfEpisode].watched) {
        isAllEpisodesChecked = false
      }
    })

    seasonEpisodesFromDatabase.forEach((episode, episodeIndex) => {
      const indexOfEpisode = seasonLength - 1 - episodeIndex
      seasonEpisodes[indexOfEpisode].watched = !isAllEpisodesChecked
      seasonEpisodesAirDate[indexOfEpisode].watched = !isAllEpisodesChecked
    })

    this.props.firebase
      .userShowSeasonEpisodes({
        uid: this.props.authUser.uid,
        key: showInfo.id,
        seasonNum,
      })
      .set(seasonEpisodes)

    console.log(seasonEpisodesAirDate)

    if (this.props.toWatchPage) {
      this.props.firebase
        .userShowSeasonEpisodesNotFinished({
          uid: this.props.authUser.uid,
          key: showInfo.id,
          seasonNum,
        })
        .set(seasonEpisodesAirDate, () => {
          isAllEpisodesWatched({
            showInfo,
            releasedEpisodes,
            authUser: this.props.authUser,
            firebase: this.props.firebase,
            singleEpisode: false,
          })
        })
    }
  }

  checkEveryShowEpisode = () => {
    const showInfo = this.props.showInfo
    const episodesFromDatabase = this.props.episodesFromDatabase
    const releasedEpisodes = this.props.releasedEpisodes

    let isAllEpisodesChecked = true
    let userEpisodesFormated = []

    episodesFromDatabase.forEach((season) => {
      const episodes = season.episodes

      userEpisodesFormated = [...userEpisodesFormated, ...episodes]
    })

    releasedEpisodes.forEach((episode, episodeIndex) => {
      const indexOfEpisode = releasedEpisodes.length - 1 - episodeIndex
      if (!userEpisodesFormated[indexOfEpisode].watched) {
        isAllEpisodesChecked = false
      }
    })

    releasedEpisodes.forEach((episode, episodeIndex) => {
      userEpisodesFormated[episodeIndex].watched = !isAllEpisodesChecked
    })

    this.props.firebase.userShowAllEpisodes(this.props.authUser.uid, showInfo.id).set(episodesFromDatabase)
  }

  render() {
    const showCheckboxes = this.props.showInfo && this.props.showDatabaseOnClient !== "notWatchingShows"
    return (
      <>
        {showCheckboxes && this.props.detailesPage && (
          <div className="episodes__check-all-episodes">
            <button type="button" className="button" onClick={() => this.checkEveryShowEpisode()}>
              Check all episodes
            </button>
          </div>
        )}
        <div className="episodes">
          {this.props.seasonsArr.map((season) => {
            if (season.season_number === 0 || season.name === "Specials") return null

            const seasonId = season.id

            const seasonEpisodesNotWatched =
              this.props.toWatchPage && season.episodes.filter((episode) => !episode.watched)

            const daysToNewSeason = differenceBtwDatesInDays(season.air_date, todayDate)

            const episodeToString =
              this.props.toWatchPage &&
              seasonEpisodesNotWatched[seasonEpisodesNotWatched.length - 1].episode_number.toString()
            const episodeNumber =
              episodeToString && episodeToString.length === 1
                ? "e0".concat(episodeToString)
                : "e".concat(episodeToString)

            return (
              <div
                key={seasonId}
                className={classNames("episodes__episode-group", {
                  "episodes__episode-group--no-poster": !season.poster_path,
                })}
                style={
                  !this.state.loadingEpisodesIds.includes(seasonId) ? { rowGap: "10px" } : { rowGap: "0px" }
                }
              >
                <div
                  className={classNames("episodes__episode-group-info", {
                    "episodes__episode-group-info--open": this.state.openSeasons.includes(seasonId),
                  })}
                  style={
                    daysToNewSeason > 0
                      ? {
                          backgroundColor: "rgba(132, 90, 90, 0.3)",
                        }
                      : {
                          backgroundColor: "#1d1d1d96",
                        }
                  }
                  onClick={() => this.showSeasonsEpisodes(seasonId, season.season_number)}
                >
                  <div className="episodes__episode-group-name">Season {season.season_number}</div>
                  {daysToNewSeason > 0 && (
                    <div className="episodes__episode-group-days-to-air">{daysToNewSeason} days to air</div>
                  )}

                  {this.props.toWatchPage && (
                    <div className="episodes__episode-group-episodes-left">
                      {seasonEpisodesNotWatched.length} episodes left <span>from {episodeNumber}</span>
                    </div>
                  )}

                  <div className="episodes__episode-group-date">
                    {season.air_date && season.air_date.slice(0, 4)}
                  </div>
                </div>

                {this.state.openSeasons.includes(seasonId) &&
                  (!this.state.loadingEpisodesIds.includes(seasonId) ? (
                    <>
                      {season.poster_path && this.props.detailesPage && (
                        <div className="episodes__episode-group-poster-wrapper">
                          {this.props.showInfo && daysToNewSeason <= 0 && (
                            <UserRating
                              id={this.props.showInfo.id}
                              firebaseRef="userShowSeason"
                              seasonNum={season.season_number}
                              seasonRating={true}
                            />
                          )}

                          <div
                            className="episodes__episode-group-poster"
                            style={{
                              backgroundImage: `url(https://image.tmdb.org/t/p/w500/${season.poster_path})`,
                            }}
                          />
                          {showCheckboxes && daysToNewSeason < 0 && (
                            <div className="episodes__episode-group-check-all-episodes">
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
                        detailesPage={this.props.detailesPage}
                        seasonsArr={this.props.seasonsArr}
                        showEpisodes={this.state.showEpisodes}
                        toWatchPage={this.props.toWatchPage}
                        showTitle={this.props.showTitle}
                        detailEpisodeInfo={this.state.detailEpisodeInfo}
                        showEpisodeInfo={this.showEpisodeInfo}
                        season={season}
                        seasonId={seasonId}
                        authUser={this.props.authUser}
                        episodesFromDatabase={this.props.episodesFromDatabase}
                        showInfo={this.props.showInfo}
                        showDatabaseOnClient={this.props.showDatabaseOnClient}
                        toggleWatchedEpisode={this.toggleWatchedEpisode}
                      />
                      {this.props.toWatchPage && (
                        <div className="episodes__episode-group-check-all-episodes">
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

export default withUserContent(ShowsEpisodes)

ShowsEpisodes.contextType = AppContext
