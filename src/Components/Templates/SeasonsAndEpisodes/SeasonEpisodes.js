/* eslint-disable array-callback-return */
import React, { Component } from "react"
import { differenceBtwDatesInDays, todayDate } from "Utils"
import classNames from "classnames"
import * as _get from "lodash.get"
import { Link } from "react-router-dom"
import * as ROUTES from "Utils/Constants/routes"
import UserRating from "../../UserRating/UserRating"

const FADE_OUT_SPEED = 300

export default class SeasonEpisodes extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showTorrentLinks: [],
      fadeOutEpisodes: [],
      moveUpEpisodes: [],
      disableCheckboxWarning: null,
      checkbox: "",
    }

    this.episode = React.createRef()
    this.checkboxRef = React.createRef()
    this.registerWarningRef = React.createRef()

    this.episodeFadeOutTimeout = null
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  handleClickOutside = (e) => {
    if (this.props.authUser) return
    if (
      this.checkboxRef.current &&
      this.registerWarningRef.current &&
      !this.checkboxRef.current.contains(e.target) &&
      !this.registerWarningRef.current.contains(e.target)
    ) {
      this.setState({
        disableCheckboxWarning: null,
      })
    }
  }

  showDissableCheckboxWarning = (checkboxId) => {
    if (this.props.authUser) return
    this.setState({
      disableCheckboxWarning: checkboxId,
    })
  }

  toggleTorrentLinks = (id) => {
    const allreadyShowed = this.state.showTorrentLinks.includes(id)

    if (allreadyShowed) {
      this.setState({
        showTorrentLinks: this.state.showTorrentLinks.filter((item) => item !== id),
      })
    } else {
      this.setState({
        showTorrentLinks: [...this.state.showTorrentLinks, id],
      })
    }
  }

  handleFadeOut = (episodeId, episodeIndex) => {
    if (this.state.fadeOutEpisodes.find((item) => item.id === episodeId)) return

    clearTimeout(this.episodeFadeOutTimeout)

    this.setState({
      fadeOutEpisodes: [...this.state.fadeOutEpisodes, { id: episodeId, index: episodeIndex }],
    })

    this.episodeFadeOutTimeout = setTimeout(() => {
      const fadeOutEpisodes = this.state.fadeOutEpisodes
      this.setState({
        fadeOutEpisodes: [],
      })

      fadeOutEpisodes.forEach((item) => {
        this.props.toggleWatchedEpisode(this.props.season.season_number, item.index)
      })
    }, FADE_OUT_SPEED)
  }

  render() {
    const showCheckboxes =
      this.props.showInfo &&
      this.props.showDatabaseOnClient !== "notWatchingShows" &&
      this.props.episodesFromDatabase &&
      this.props.episodesFromDatabase.length > 0 &&
      true

    const showSeason = showCheckboxes && this.props.episodesFromDatabase[this.props.season.season_number - 1]

    const seasons = this.props.toWatchPage ? this.props.seasonsArr : this.props.showEpisodes

    return (
      <div className="episodes__episode-list">
        {seasons.map((item) => {
          const seasonId = this.props.toWatchPage ? item.id : item.seasonId

          if (seasonId !== this.props.seasonId) return null

          return item.episodes.map((episode, episodeIndex) => {
            if (this.props.toWatchPage && episode.watched) return
            const indexOfEpisode = item.episodes.length - 1 - episodeIndex

            const urlShowTitle = this.props.showTitle.split(" ").join("+")
            // Format Date //
            const airDateISO = episode.air_date && new Date(episode.air_date).toISOString()

            const optionss = {
              month: "long",
              day: "numeric",
              year: "numeric",
            }

            const formatedDate = new Date(airDateISO)

            const episodeAirDate = episode.air_date
              ? new Intl.DateTimeFormat("en-US", optionss).format(formatedDate)
              : "No date available"
            // Format Date End //

            // Format Seasons And Episode Numbers //
            const seasonToString = this.props.season.season_number.toString()
            const episodeToString = episode.episode_number.toString()

            const seasonNumber =
              seasonToString.length === 1 ? "s0".concat(seasonToString) : "s".concat(seasonToString)
            const episodeNumber =
              episodeToString.length === 1 ? "e0".concat(episodeToString) : "e".concat(episodeToString)
            // Format Seasons And Episode Numbers End //

            const episodeAirDateAsDateObj = new Date(episode.air_date)

            const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)

            return (
              <div
                ref={this.episode}
                key={episode.id}
                className={classNames("episodes__episode", {
                  "episodes__episode--open": this.props.detailEpisodeInfo.includes(episode.id),
                  "fade-out-episode":
                    this.props.toWatchPage &&
                    this.state.fadeOutEpisodes.find((item) => item.id === episode.id),
                })}
              >
                <div
                  className="episodes__episode-wrapper"
                  onClick={() => this.props.detailesPage && this.props.showEpisodeInfo(episode.id)}
                  style={
                    daysToNewEpisode > 0 || !episode.air_date
                      ? {
                          backgroundColor: "rgba(132, 90, 90, 0.3)",
                        }
                      : {
                          backgroundColor: "#1d1d1d96",
                        }
                  }
                >
                  {this.props.toWatchPage && (
                    <UserRating
                      id={this.props.showInfo.id}
                      firebaseRef="userShowSingleEpisode"
                      seasonNum={this.props.season.season_number}
                      episodeNum={indexOfEpisode}
                      episodeId={episode.id}
                      handleFadeOut={this.handleFadeOut}
                      toWatchPage={this.props.toWatchPage}
                    />
                  )}
                  <div className="episodes__episode-date">{episodeAirDate}</div>
                  <div className="episodes__episode-name">
                    <span className="episodes__episode-number">{episode.episode_number}.</span>
                    {episode.name}
                  </div>
                  {daysToNewEpisode > 0 ? (
                    <div className="episodes__episode-days-to-air">{daysToNewEpisode} days</div>
                  ) : (
                    episodeAirDateAsDateObj < todayDate.getTime() &&
                    episode.air_date &&
                    this.props.toWatchPage && (
                      <>
                        <div
                          className={classNames(
                            "torrent-links torrent-links--episodes torrent-links--to-watch-page-desktop",
                            {
                              "torrent-links--to-watch-page": this.props.toWatchPage,
                            }
                          )}
                        >
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
                      </>
                    )
                  )}
                </div>

                {daysToNewEpisode <= 0 && episode.air_date && (
                  <div
                    ref={this.checkboxRef}
                    className="episodes__episode-checkbox"
                    onClick={() => this.showDissableCheckboxWarning(episode.id)}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={_get(showSeason, `episodes.${indexOfEpisode}.watched`, false)}
                        onChange={() => {
                          if (this.props.toWatchPage) {
                            this.handleFadeOut(episode.id, indexOfEpisode)
                          } else {
                            this.props.toggleWatchedEpisode(this.props.season.season_number, indexOfEpisode)
                          }
                        }}
                        disabled={!showCheckboxes || !this.props.authUser}
                      />
                      <span
                        className={classNames("custom-checkmark", {
                          "custom-checkmark--disabled": !showCheckboxes || !this.props.authUser,
                        })}
                      />
                    </label>
                    {this.state.disableCheckboxWarning === episode.id && (
                      <div ref={this.registerWarningRef} className="buttons__col-warning">
                        To use full features please{" "}
                        <Link className="buttons__col-link" to={ROUTES.LOGIN_PAGE}>
                          register
                        </Link>
                        . Your allready selected shows will be saved.
                      </div>
                    )}
                  </div>
                )}

                {this.props.detailEpisodeInfo.includes(episode.id) && (
                  <div
                    className={classNames("episodes__episode-detailes", {
                      "episodes__episode-detailes--no-image": !episode.still_path,
                    })}
                  >
                    {episode.still_path && (
                      <div
                        className="episodes__episode-detailes-image"
                        style={{
                          backgroundImage: `url(https://image.tmdb.org/t/p/w500${episode.still_path})`,
                        }}
                      />
                    )}
                    {episode.overview && (
                      <div className="episodes__episode-detailes-overview">{episode.overview}</div>
                    )}

                    {episodeAirDateAsDateObj < todayDate.getTime() && episode.air_date && (
                      <>
                        {this.props.showInfo && (
                          <UserRating
                            id={this.props.showInfo.id}
                            firebaseRef="userShowSingleEpisode"
                            seasonNum={this.props.season.season_number}
                            episodeNum={indexOfEpisode}
                            episodeRating={true}
                          />
                        )}

                        <div className="torrent-links torrent-links--episodes">
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
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })
        })}
      </div>
    )
  }
}
