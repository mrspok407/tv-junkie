/* eslint-disable array-callback-return */
import React, { Component } from "react"
import { differenceBtwDatesInDays } from "Utils"
import classNames from "classnames"

export default class SeasonEpisodes extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showTorrentLinks: []
    }
  }

  componentDidMount() {}

  toggleTorrentLinks = id => {
    const allreadyShowed = this.state.showTorrentLinks.includes(id)

    if (allreadyShowed) {
      this.setState({
        showTorrentLinks: this.state.showTorrentLinks.filter(item => item !== id)
      })
    } else {
      this.setState({
        showTorrentLinks: [...this.state.showTorrentLinks, id]
      })
    }
  }

  render() {
    const showCheckboxes =
      this.props.authUser &&
      this.props.showInDatabase.info &&
      this.props.showInDatabase.database !== "notWatchingShows" &&
      this.props.showInDatabase.info.episodes &&
      this.props.showInDatabase.info.episodes.length > 0 &&
      true

    const showSeason =
      showCheckboxes && this.props.showInDatabase.info.episodes[this.props.season.season_number - 1]

    console.log(this.props.showInDatabase)

    const seasons = this.props.toWatchPage ? this.props.seasonsArr : this.props.showEpisodes

    return (
      <div
        className={classNames("episodes__episode-list", {
          "episodes__episode-list--to-watch-page": this.props.toWatchPage
        })}
      >
        {seasons.map(item => {
          const seasonId = this.props.toWatchPage ? item.id : item.seasonId

          if (seasonId !== this.props.seasonId) return null

          return item.episodes.map((episode, episodeIndex) => {
            if (this.props.toWatchPage && episode.watched) return
            //console.log(episodeIndex)
            // console.log(episode.episode_number)

            const indexOfEpisode = item.episodes.length - 1 - episodeIndex

            // console.log(indexOfEpisode)
            // console.log(episode.episode_number)

            const urlShowTitle = this.props.showTitle.split(" ").join("+")
            // Format Date //
            const airDateISO = episode.air_date && new Date(episode.air_date).toISOString()

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
            const seasonToString = this.props.season.season_number.toString()
            const episodeToString = episode.episode_number.toString()

            const seasonNumber =
              seasonToString.length === 1 ? "s0".concat(seasonToString) : "s".concat(seasonToString)
            const episodeNumber =
              episodeToString.length === 1 ? "e0".concat(episodeToString) : "e".concat(episodeToString)
            // Format Seasons And Episode Numbers End //

            const episodeAirDateAsDateObj = new Date(episode.air_date)

            const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, this.props.todayDate)

            return (
              <div
                key={episode.id}
                className={classNames("episodes__episode", {
                  "episodes__episode--open": this.props.detailEpisodeInfo.includes(episode.id),
                  "episodes__episode--to-watch-page": this.props.toWatchPage
                })}
              >
                <div
                  className={classNames("episodes__episode-wrapper", {
                    "episodes__episode-wrapper--to-watch-page": this.props.toWatchPage
                  })}
                  onClick={() => this.props.fullContentPage && this.props.showEpisodeInfo(episode.id)}
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
                  <div className="episodes__episode-date">{episodeAirDate}</div>
                  <div className="episodes__episode-name">
                    <span className="episodes__episode-number">{episode.episode_number}.</span>
                    {episode.name}
                  </div>
                  {daysToNewEpisode > 0 ? (
                    <div className="episodes__episode-days-to-air">{daysToNewEpisode} days</div>
                  ) : (
                    episodeAirDateAsDateObj < this.props.todayDate.getTime() &&
                    episode.air_date &&
                    this.props.toWatchPage && (
                      <>
                        <div
                          className={classNames(
                            "torrent-links torrent-links--episodes torrent-links--to-watch-page-desktop",
                            {
                              "torrent-links--to-watch-page": this.props.toWatchPage
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

                        <button
                          type="button"
                          className="torrent-links__link-button"
                          onClick={() => this.toggleTorrentLinks(episode.id)}
                        >
                          Links
                        </button>

                        {this.state.showTorrentLinks.includes(episode.id) && (
                          <div
                            className={classNames(
                              "torrent-links torrent-links--episodes torrent-links--to-watch-page-mobile",
                              {
                                "torrent-links--to-watch-page": this.props.toWatchPage
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
                        )}
                      </>
                    )
                  )}
                </div>

                {showCheckboxes && daysToNewEpisode < 0 && episode.air_date && (
                  <div className="episodes__episode-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={
                          // .episodes[episode.episode_number - 1].watched
                          showSeason && showSeason.episodes[indexOfEpisode].watched
                        }
                        onChange={() =>
                          this.props.toggleWatchedEpisode(
                            this.props.season.season_number,
                            // episode.episode_number
                            indexOfEpisode
                          )
                        }
                      />
                      <span className="custom-checkmark" />
                    </label>
                  </div>
                )}

                {this.props.detailEpisodeInfo.includes(episode.id) && (
                  <div
                    className={classNames("episodes__episode-detailes", {
                      "episodes__episode-detailes--no-image": !episode.still_path
                    })}
                  >
                    {episode.still_path && (
                      <div
                        className="episodes__episode-detailes-image"
                        style={{
                          backgroundImage: `url(https://image.tmdb.org/t/p/w500${episode.still_path})`
                        }}
                      />
                    )}
                    {episode.overview && (
                      <div className="episodes__episode-detailes-overview">{episode.overview}</div>
                    )}

                    {episodeAirDateAsDateObj < this.props.todayDate.getTime() && episode.air_date && (
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
