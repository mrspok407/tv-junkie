import React, { Component } from "react"
import { differenceBtwDatesInDays } from "Utils"
import Loader from "Components//Placeholders/Loader"
import classNames from "classnames"
import SeasonEpisodes from "./SeasonEpisodes"

class ShowsEpisodesNotAuthUser extends Component {
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
                    <SeasonEpisodes
                      showEpisodes={this.props.showEpisodes}
                      showTitle={this.props.showTitle}
                      todayDate={this.props.todayDate}
                      detailEpisodeInfo={this.props.detailEpisodeInfo}
                      showEpisodeInfo={this.props.showEpisodeInfo}
                      season={season}
                      seasonId={seasonId}
                    />
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

export default ShowsEpisodesNotAuthUser
