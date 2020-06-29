import React, { Component } from "react"
import { differenceBtwDatesInDays } from "Utils"
import Loader from "Components//Placeholders/Loader"
import axios from "axios"
import classNames from "classnames"
import SeasonEpisodes from "./SeasonEpisodes"

class ShowsEpisodesAuthUser extends Component {
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
                // style={
                //   !this.state.loadingEpisodesIds.includes(seasonId) ? { rowGap: "10px" } : { rowGap: "0px" }
                // }
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
                  onClick={() => this.props.showSeasonsEpisodeAuthUser(seasonId)}
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

                {this.props.openSeasons.includes(seasonId) && (
                  <>
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
                            onClick={() => this.props.checkEverySeasonEpisode(season.season_number)}
                          >
                            Check everything
                          </button>
                          <button
                            type="button"
                            className="button"
                            onClick={() => this.props.checkEveryShowEpisode()}
                          >
                            Check all
                          </button>
                        </div>
                      </div>
                    )}

                    {this.props.showInDb.episodes ? (
                      <div className="full-detailes__episodes-list">
                        {this.props.showInDb.episodes[season.season_number - 1] &&
                          this.props.showInDb.episodes[season.season_number - 1].map(episode => {
                            // if (item.seasonId !== seasonId) return null

                            const urlShowTitle = this.props.showTitle.split(" ").join("+")
                            // Format Date //
                            const airDateISO = episode.airdate && new Date(episode.airdate).toISOString()

                            const optionss = {
                              month: "long",
                              day: "numeric",
                              year: "numeric"
                            }

                            const formatedDate = new Date(airDateISO)

                            const episodeAirDate = episode.airdate
                              ? new Intl.DateTimeFormat("en-US", optionss).format(formatedDate)
                              : "No date available"
                            // Format Date End //

                            // Format Seasons And Episode Numbers //
                            const seasonToString = episode.season && episode.season.toString()
                            const episodeToString = episode.number && episode.number.toString()

                            const seasonNumber =
                              seasonToString.length === 1
                                ? "s0".concat(seasonToString)
                                : "s".concat(seasonToString)
                            const episodeNumber =
                              episodeToString.length === 1
                                ? "e0".concat(episodeToString)
                                : "e".concat(episodeToString)
                            // Format Seasons And Episode Numbers End //

                            const episodeAirDateAsDateObj = new Date(episode.airdate)

                            const daysToNewEpisode = differenceBtwDatesInDays(
                              episode.airdate,
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
                                    daysToNewEpisode > 0 || !episode.airdate
                                      ? {
                                          backgroundColor: "rgba(132, 90, 90, 0.3)"
                                        }
                                      : {
                                          backgroundColor: "#1d1d1d96"
                                        }
                                  }
                                >
                                  <div className="full-detailes__episode-date">{episodeAirDate}</div>
                                  <div className="full-detailes__episode-name">
                                    <span className="full-detailes__episode-number">{episode.number}.</span>
                                    {episode.name}
                                  </div>
                                  {daysToNewEpisode > 0 && (
                                    <div className="full-detailes__episode-when-new-episode">
                                      {daysToNewEpisode} days
                                    </div>
                                  )}
                                </div>
                                <div className="full-detailes__episode-checkbox">
                                  <label>
                                    <input
                                      type="checkbox"
                                      checked={episode.watched}
                                      onChange={() =>
                                        this.props.toggleWatchedEpisode(
                                          this.props.id,
                                          season.season_number,
                                          episode.number
                                        )
                                      }
                                    />
                                    <span className="custom-checkmark" />
                                  </label>
                                </div>

                                {this.props.detailEpisodeInfo.includes(episode.id) && (
                                  <div
                                    className={classNames("full-detailes__episode-detailes", {
                                      "full-detailes__episode-detailes--no-image":
                                        episode.image && !episode.image.medium
                                    })}
                                  >
                                    {episode.image && episode.image.medium && (
                                      <div
                                        className="full-detailes__episode-detailes-image"
                                        style={{
                                          backgroundImage: `url(${episode.image && episode.image.medium})`
                                        }}
                                      />
                                    )}
                                    {episode.summary && (
                                      <div className="full-detailes__episode-detailes-overview">
                                        {episode.summary}
                                      </div>
                                    )}

                                    {episodeAirDateAsDateObj < this.props.todayDate.getTime() &&
                                      episode.airdate && (
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
                          })}
                      </div>
                    ) : this.props.showEpisodes.length === 0 ? (
                      <Loader className="loader--small-pink" />
                    ) : (
                      <SeasonEpisodes
                        showEpisodes={this.props.showEpisodes}
                        showTitle={this.props.showTitle}
                        todayDate={this.props.todayDate}
                        detailEpisodeInfo={this.props.detailEpisodeInfo}
                        showEpisodeInfo={this.props.showEpisodeInfo}
                        season={season}
                        seasonId={seasonId}
                        authUser={true}
                      />
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </>
    )
  }
}

export default ShowsEpisodesAuthUser
