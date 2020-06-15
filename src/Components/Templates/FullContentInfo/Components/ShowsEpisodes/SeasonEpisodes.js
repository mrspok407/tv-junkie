import React, { Component } from "react"
import { differenceBtwDatesInDays } from "Utils"
import classNames from "classnames"
import Loader from "Components//Placeholders/Loader"

export default class SeasonEpisodes extends Component {
  render() {
    return (
      <div className="full-detailes__episodes-list">
        {this.props.showEpisodes.map(item => {
          if (item.seasonId !== this.props.seasonId) return null

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
                className={classNames("full-detailes__episode", {
                  "full-detailes__episode--open": this.props.detailEpisodeInfo.includes(episode.id)
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
                  {this.props.authUser && (
                    <div className="div">
                      <Loader className="loader--small-pink" />
                    </div>
                  )}

                  <div className="full-detailes__episode-date">{episodeAirDate}</div>
                  <div className="full-detailes__episode-name">
                    <span className="full-detailes__episode-number">{episode.episode_number}.</span>
                    {episode.name}
                  </div>
                  {daysToNewEpisode > 0 && (
                    <div className="full-detailes__episode-when-new-episode">{daysToNewEpisode} days</div>
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
                      <div className="full-detailes__episode-detailes-overview">{episode.overview}</div>
                    )}

                    {episodeAirDateAsDateObj < this.props.todayDate.getTime() && episode.air_date && (
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
    )
  }
}