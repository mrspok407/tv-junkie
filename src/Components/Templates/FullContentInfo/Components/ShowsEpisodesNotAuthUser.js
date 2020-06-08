import React, { Component } from "react"
import { differenceBtwDatesInDays } from "Utils"
import { withUserContent } from "Components/UserContent"
import CheckboxInput from "Components/SearchPage/Search/AdvancedSearch/InputTemplates/CheckboxInput"
import Loader from "Components//Placeholders/Loader"
import axios, { CancelToken } from "axios"
import classNames from "classnames"

let cancelRequest

class ShowsEpisodes extends React.PureComponent {
  // constructor(props) {
  //   super(props)

  //   this.state = {
  //     loadingEpisodesIds: [],
  //     openSeasons: [],
  //     showEpisodes: [],
  //     detailEpisodeInfo: [],
  //     errorShowEpisodes: ""
  //   }
  // }

  // componentDidMount() {
  //   this._isMounted = true
  //   console.log("not authUser")
  // }

  // componentWillUnmount() {
  //   this._isMounted = false
  //   if (cancelRequest !== undefined) {
  //     cancelRequest()
  //   }
  // }

  // showSeasonsEpisode = (seasonId, seasonNum) => {
  //   if (this.state.openSeasons.includes(seasonId)) {
  //     this.setState(prevState => ({
  //       openSeasons: [...prevState.openSeasons.filter(item => item !== seasonId)]
  //     }))
  //   } else {
  //     this.setState(prevState => ({
  //       openSeasons: [...prevState.openSeasons, seasonId]
  //     }))
  //   }

  //   if (this.state.showEpisodes.some(item => item.seasonId === seasonId)) return

  //   this.setState(prevState => ({
  //     loadingEpisodesIds: [...prevState.loadingEpisodesIds, seasonId]
  //   }))

  //   axios
  //     .get(
  //       `https://api.themoviedb.org/3/tv/${this.props.id}/season/${seasonNum}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`,
  //       {
  //         cancelToken: new CancelToken(function executor(c) {
  //           cancelRequest = c
  //         })
  //       }
  //     )
  //     .then(({ data: { episodes } }) => {
  //       if (!this._isMounted) return

  //       const episodesReverse = episodes.reverse()

  //       this.setState(prevState => ({
  //         showEpisodes: [...prevState.showEpisodes, { seasonId, episodes: episodesReverse }],
  //         loadingEpisodesIds: [...prevState.loadingEpisodesIds.filter(item => item !== seasonId)],
  //         errorShowEpisodes: ""
  //       }))
  //     })
  //     .catch(err => {
  //       if (axios.isCancel(err) || !this._isMounted) return
  //       this.setState({
  //         loadingEpisodesIds: [],
  //         errorShowEpisodes: "Something went wrong, sorry"
  //       })
  //     })
  // }

  // showEpisodeInfo = episodeId => {
  //   if (this.state.detailEpisodeInfo.includes(episodeId)) {
  //     this.setState(prevState => ({
  //       detailEpisodeInfo: [...prevState.detailEpisodeInfo.filter(item => item !== episodeId)]
  //     }))
  //   } else {
  //     this.setState(prevState => ({
  //       detailEpisodeInfo: [...prevState.detailEpisodeInfo, episodeId]
  //     }))
  //   }
  // }

  // toggleWatchedEpisode = (showId, seasonNum, episodeNum) => {
  //   const watchingShows = this.props.userContent.watchingShows
  //   const show = watchingShows.find(item => item.id === Number(showId)) || {}
  //   const showEpisode = show.episodes[seasonNum - 1][episodeNum - 1]

  //   this.props.firebase
  //     .watchingShowsEpisode(this.props.authUser.uid, show.key, seasonNum - 1, episodeNum - 1)
  //     .update({ watched: !showEpisode.watched })
  // }

  render() {
    return (
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
                !this.props.loadingEpisodesIds.includes(seasonId) ? { rowGap: "10px" } : { rowGap: "0px" }
              }
            >
              <div
                className={classNames("full-detailes__season-info", {
                  "full-detailes__season-info--open": this.props.openSeasons.includes(seasonId)
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
                onClick={() => this.props.showSeasonsEpisode(seasonId, season.season_number)}
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

              {this.props.openSeasons.includes(seasonId) &&
                (!this.props.loadingEpisodesIds.includes(seasonId) ? (
                  <>
                    {season.poster_path && (
                      <div
                        className="full-detailes__season-poster"
                        style={{
                          backgroundImage: `url(https://image.tmdb.org/t/p/w500/${season.poster_path})`
                        }}
                      />
                    )}

                    <div className="full-detailes__episodes-list">
                      {this.props.showEpisodes.map(item => {
                        if (item.seasonId !== seasonId) return null

                        return item.episodes.map(episode => {
                          const urlShowTitle = this.props.showTitle.split(" ").join("+")
                          // Format Date //
                          const airDateISO = new Date(episode.air_date).toISOString()

                          const optionss = {
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                          }

                          const formatedDate = new Date(airDateISO)

                          const episodeAirDate = episode.air_date
                            ? new Intl.DateTimeFormat("en-US", optionss).format(formatedDate)
                            : "No date available"
                          // Format Date End //

                          // Format Seasons And Episode Numbers //
                          const seasonToString = season.season_number.toString()
                          const episodeToString = episode.episode_number.toString()

                          const seasonNumber =
                            seasonToString.length === 1
                              ? "s0".concat(seasonToString)
                              : "s".concat(seasonToString)
                          const episodeNumber =
                            episodeToString.length === 1
                              ? "e0".concat(episodeToString)
                              : "e".concat(episodeToString)
                          // Format Seasons And Episode Numbers End //

                          const episodeAirDateAsDateObj = new Date(episode.air_date)

                          const daysToNewEpisode = differenceBtwDatesInDays(
                            episode.air_date,
                            this.props.todayDate
                          )

                          return (
                            <div
                              key={episode.id}
                              className={classNames("full-detailes__episode", {
                                "full-detailes__episode--open": this.props.detailEpisodeInfo.includes(
                                  episode.id
                                )
                              })}
                            >
                              <div
                                className="full-detailes__episode-wrapper"
                                onClick={() => this.props.showEpisodeInfo(episode.id)}
                                style={
                                  daysToNewEpisode > 0 || !episode.air_date
                                    ? {
                                        backgroundColor: "rgba(132, 90, 90, 0.3)"
                                      }
                                    : {
                                        backgroundColor: "#1d1d1d96"
                                      }
                                }
                              >
                                {/* <div className="div">
                                  <div className="checkbox-input-container">
                                    <label>
                                      <input
                                        type="checkbox"
                                        onChange={() =>
                                          this.toggleWatchedEpisode(
                                            this.props.id,
                                            season.season_number,
                                            episode.episode_number
                                          )
                                        }
                                      />
                                      <span className="custom-checkmark" />
                                    </label>
                                  </div>
                                </div> */}
                                <div className="full-detailes__episode-date">{episodeAirDate}</div>
                                <div className="full-detailes__episode-name">
                                  <span className="full-detailes__episode-number">
                                    {episode.episode_number}.
                                  </span>
                                  {episode.name}
                                </div>
                                {daysToNewEpisode > 0 && (
                                  <div className="full-detailes__episode-when-new-episode">
                                    {daysToNewEpisode} days
                                  </div>
                                )}
                              </div>

                              {this.props.detailEpisodeInfo.includes(episode.id) && (
                                <div
                                  className={classNames("full-detailes__episode-detailes", {
                                    "full-detailes__episode-detailes--no-image": !episode.still_path
                                  })}
                                >
                                  {episode.still_path && (
                                    <div
                                      className="full-detailes__episode-detailes-image"
                                      style={{
                                        backgroundImage: `url(https://image.tmdb.org/t/p/w500${episode.still_path})`
                                      }}
                                    />
                                  )}
                                  {episode.overview && (
                                    <div className="full-detailes__episode-detailes-overview">
                                      {episode.overview}
                                    </div>
                                  )}

                                  {episodeAirDateAsDateObj < this.props.todayDate.getTime() &&
                                    episode.air_date && (
                                      <div className="torrent-links torrent-links--full-content">
                                        <a
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          href={`https://www.ettvdl.com/torrents-search.php?search=${urlShowTitle}+${seasonNumber}${episodeNumber}+1080p&cat=41`}
                                        >
                                          1080p
                                        </a>
                                        <a
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          href={`https://www.ettvdl.com/torrents-search.php?search=${urlShowTitle}+${seasonNumber}${episodeNumber}+720p&cat=41`}
                                        >
                                          720p
                                        </a>
                                        <a
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          href={`https://www.ettvdl.com/torrents-search.php?search=${urlShowTitle}+${seasonNumber}${episodeNumber}&cat=5`}
                                        >
                                          480p
                                        </a>
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                          )
                        })
                      })}
                    </div>
                  </>
                ) : !this.props.errorShowEpisodes ? (
                  <Loader className="loader--small-pink" />
                ) : (
                  <div>{this.props.errorShowEpisodes}</div>
                ))}
            </div>
          )
        })}
      </div>
    )
  }
}

export default withUserContent(ShowsEpisodes)
