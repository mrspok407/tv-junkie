import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { differenceBtwDatesInDays, todayDate } from "Utils"
import { organiseFutureEpisodesByMonth } from "./CalendarHelpers"
import classNames from "classnames"
import ShowsEpisodes from "Components/Templates/SeasonsAndEpisodes/ShowsEpisodes"
import Loader from "Components/Placeholders/Loader"
import PlaceholderNoToWatchEpisodes from "Components/Placeholders/PlaceholderNoToWatchEpisodes"
import merge from "deepmerge"

class CalendarContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      willAirEpisodes: [],
      initialLoading: true
    }
  }

  componentDidMount() {
    this.getContent({})
  }

  getContent = ({ sortBy = "id", isInitialLoad = true, database = "watchingShows" }) => {
    if (this.props.authUser === null) return
    if (isInitialLoad) {
      this.setState({ initialLoading: true })
    }

    this.props.firebase
      .userShows(this.props.authUser.uid, database)
      .orderByChild(sortBy)
      .once("value", snapshot => {
        let userShows = []

        snapshot.forEach(show => {
          if (show.val().status === "ended") return

          userShows.push({
            id: show.val().id,
            status: show.val().status
          })
        })

        Promise.all(
          userShows.map(show => {
            return this.props.firebase
              .showInDatabase(show.status, show.id)
              .once("value")
              .then(snapshot => {
                return snapshot.val()
              })
          })
        ).then(showsData => {
          console.log(userShows)
          console.log(showsData)

          const willAirEpisodes = organiseFutureEpisodesByMonth(showsData)

          this.setState({
            willAirEpisodes
          })

          console.log(willAirEpisodes)
        })
      })
  }

  render() {
    return (
      <div className="content-results content-results--to-watch-page">
        <div
          className={classNames("show-episodes", {
            "show-episodes--to-watch-page": this.props.toWatchPage
          })}
        >
          {this.state.willAirEpisodes.map(month => {
            return (
              <div key={month.month} className="show-episodes__season--no-poster">
                <div
                  // className={classNames("show-episodes__season-info", {
                  //   "show-episodes__season-info--open": this.state.openSeasons.includes(seasonId)
                  // })}
                  // onClick={() => this.showSeasonsEpisode(seasonId, season.season_number)}
                  className="show-episodes__season-info--open"
                >
                  <div
                    className={classNames("show-episodes__season-number", {
                      "show-episodes__season-number--to-watch-page": this.props.toWatchPage
                    })}
                  >
                    Month {month.month}
                  </div>
                </div>

                {month.episodes.map(episode => {
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
                  const seasonToString = episode.season_number.toString()
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
                      key={episode.id}
                      className={classNames("show-episodes__episode", {
                        "show-episodes__episode--to-watch-page": this.props.toWatchPage
                      })}
                    >
                      <div
                        className={classNames("show-episodes__episode-wrapper", {
                          "show-episodes__episode-wrapper--to-watch-page": this.props.toWatchPage
                        })}
                        // onClick={() => this.props.fullContentPage && this.props.showEpisodeInfo(episode.id)}
                      >
                        <div className="show-episodes__episode-date">{episodeAirDate}</div>
                        <div className="show-episodes__episode-name">
                          <span className="show-episodes__episode-number">{episode.episode_number}.</span>
                          {episode.show}
                          {episode.name}
                        </div>
                        {daysToNewEpisode > 0 && (
                          <div className="show-episodes__episode-days-to-air">{daysToNewEpisode} days</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default withUserContent(CalendarContent)
