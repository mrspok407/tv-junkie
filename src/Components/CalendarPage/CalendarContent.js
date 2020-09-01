import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { differenceBtwDatesInDays, todayDate } from "Utils"
import { organiseFutureEpisodesByMonth, organizeMonthEpisodesByEpisodeNumber } from "./CalendarHelpers"
import classNames from "classnames"
import Loader from "Components/Placeholders/Loader"
import PlaceholderNoFutureEpisodes from "Components/Placeholders/PlaceholderNoFutureEpisodes"

class CalendarContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      willAirEpisodes: [],
      openMonths: [],
      initialLoading: true
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.getContent({})
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  getContent = ({ sortBy = "id", isInitialLoad = true, database = "watchingShows" }) => {
    if (this.props.authUser === null) return
    if (isInitialLoad) {
      this.setState({ initialLoading: true })
    }
    if (this.props.homePage) this.props.handleCalendarState({ loading: true })

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
          if (!this._isMounted) return

          const willAirEpisodes = organiseFutureEpisodesByMonth(showsData)

          const months = willAirEpisodes.map(item => {
            return Object.values(item)[0]
          })

          this.setState({
            willAirEpisodes,
            openMonths: this.props.homePage ? [months[0]] : months,
            initialLoading: false
          })
          if (this.props.homePage) this.props.handleCalendarState({ loading: false, willAirEpisodes })
        })
      })
  }

  showMonthEpisodes = month => {
    if (this.state.openMonths.includes(month)) {
      this.setState({
        openMonths: this.state.openMonths.filter(item => item !== month)
      })
    } else {
      this.setState({
        openMonths: [...this.state.openMonths, month]
      })
    }
  }

  render() {
    const willAirEpisodes = this.props.homePage
      ? this.state.willAirEpisodes.slice(0, 2)
      : this.state.willAirEpisodes

    return (
      <div className="content-results content-results--calendar">
        {this.state.initialLoading ? (
          <Loader className="loader--pink" />
        ) : this.state.willAirEpisodes.length === 0 && !this.props.homePage ? (
          <PlaceholderNoFutureEpisodes />
        ) : (
          <div className="episodes episodes--calendar">
            {willAirEpisodes.map(month => {
              const date = new Date(month.month)
              const monthLongName = date.toLocaleString("en", { month: "long" })

              const monthEpisodes = organizeMonthEpisodesByEpisodeNumber(month.episodes)

              return (
                <div key={month.month} className="episodes__episode-group">
                  <div
                    className={classNames("episodes__episode-group-info", {
                      "episodes__episode-group-info--open": this.state.openMonths.includes(month.month)
                    })}
                    // onClick={() => this.showSeasonsEpisode(seasonId, season.season_number)}
                    onClick={() => this.showMonthEpisodes(month.month)}
                  >
                    <div className="episodes__episode-group-name">
                      {todayDate.getFullYear() !== date.getFullYear() ? (
                        <>
                          {monthLongName}
                          <span>{date.getFullYear()}</span>
                        </>
                      ) : (
                        monthLongName
                      )}
                    </div>
                    <div className="episodes__episode-group-episodes-left">
                      {month.episodes.length} {month.episodes.length > 1 ? "episodes" : "episode"}
                    </div>
                  </div>

                  <div className="episodes__episode-list">
                    {this.state.openMonths.includes(month.month) && (
                      <>
                        {monthEpisodes.map((episode, episodeIndex, array) => {
                          const prevEpisode = array[episodeIndex - 1]
                          const prevEpisodeAirDate = prevEpisode && prevEpisode.air_date

                          // Format Date //
                          const airDateISO = episode.air_date && new Date(episode.air_date).toISOString()

                          const options = {
                            weekday: "short",
                            day: "numeric"
                          }

                          const formatedDate = new Date(airDateISO)

                          const episodeAirDate = episode.air_date
                            ? new Intl.DateTimeFormat("en-US", options)
                                .format(formatedDate)
                                .split(" ")
                                .join(", ")
                            : "No date available"
                          // Format Date End //

                          // Format Seasons And Episode Numbers //
                          const seasonToString = episode.season_number.toString()
                          const episodeToString = episode.episode_number.toString()

                          const seasonNumber =
                            seasonToString.length === 1
                              ? "s".concat(seasonToString)
                              : "s".concat(seasonToString)
                          const episodeNumber =
                            episodeToString.length === 1
                              ? "e0".concat(episodeToString)
                              : "e".concat(episodeToString)
                          // Format Seasons And Episode Numbers End //

                          // const episodeAirDateAsDateObj = new Date(episode.air_date)

                          const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)
                          const willAirToday = daysToNewEpisode === 0

                          return (
                            <div key={episode.id} className="episodes__episode">
                              <div className="episodes__episode-wrapper">
                                <div className="episodes__episode-date">
                                  {episode.air_date !== prevEpisodeAirDate && episodeAirDate}
                                </div>
                                <div className="episodes__episode-wrapper--calendar">
                                  <div className="episodes__episode-show-name">
                                    <Link to={`/show/${episode.showId}`}>{episode.show}</Link>
                                  </div>
                                  <div className="episodes__episode-episode-number">
                                    {seasonNumber}
                                    {episodeNumber}
                                  </div>
                                  <div className="episodes__episode-episode-title">{episode.name}</div>
                                </div>
                                {daysToNewEpisode >= 0 && (
                                  <div
                                    className={classNames("episodes__episode-days-to-air", {
                                      "episodes__episode-days-to-air--today": willAirToday
                                    })}
                                  >
                                    {daysToNewEpisode > 1
                                      ? `${daysToNewEpisode} days`
                                      : daysToNewEpisode === 1
                                      ? "1 day"
                                      : willAirToday && "Today"}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
}

export default withUserContent(CalendarContent)
