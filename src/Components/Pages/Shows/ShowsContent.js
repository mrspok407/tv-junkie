import React, { Component } from "react"
import { Link } from "react-router-dom"
import { listOfGenres } from "Utils"
import { throttle } from "throttle-debounce"
import classNames from "classnames"
import PlaceholderNoShows from "Components/UI/Placeholders/PlaceholderNoShows"
import Loader from "Components/UI/Placeholders/Loader"
import { AppContext } from "Components/AppContext/AppContextHOC"

const SHOWS_TO_LOAD_INITIAL = 15
const SCROLL_THRESHOLD = 800

class ShowsContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeSection: "watchingShows",
      sortBy: "name",
      disableLoad: {
        watchingShows: false,
        droppedShows: false,
        willWatchShows: false,
        finishedShows: false,
        watchingShowsLS: false
      },
      loadedShows: {
        watchingShows: SHOWS_TO_LOAD_INITIAL,
        watchingShowsLS: SHOWS_TO_LOAD_INITIAL,
        droppedShows: SHOWS_TO_LOAD_INITIAL,
        willWatchShows: SHOWS_TO_LOAD_INITIAL,
        finishedShows: SHOWS_TO_LOAD_INITIAL
      }
    }
  }

  componentDidMount() {
    this._isMounted = true

    window.addEventListener("scroll", this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll)

    this._isMounted = false
  }

  toggleSection = (section) => {
    this.setState({
      activeSection: section
    })
  }

  loadNewContent = () => {
    if (this.state.disableLoad[this.state.activeSection]) return

    this.setState({
      loadedShows: {
        ...this.state.loadedShows,
        [this.state.activeSection]: this.state.loadedShows[this.state.activeSection] + SHOWS_TO_LOAD_INITIAL
      },
      disableLoad: {
        ...this.state.disableLoad,
        [this.state.activeSection]:
          this.state.loadedShows[this.state.activeSection] >=
          this.context.userContent.userShows.filter((show) =>
            this.state.activeSection === "finishedShows"
              ? !!show.finished
              : !!(show.database === this.state.activeSection && !show.finished)
          ).length
      }
    })
  }

  loadNewContentLS = () => {
    if (this.state.disableLoad.watchingShowsLS || this.context.authUser === null) return

    this.setState({
      loadedShows: {
        ...this.state.loadedShows,
        watchingShowsLS: this.state.loadedShows.watchingShowsLS + SHOWS_TO_LOAD_INITIAL
      },
      disableLoad: {
        ...this.state.disableLoad,
        watchingShowsLS:
          this.state.loadedShows.watchingShowsLS >=
            this.context.userContentLocalStorage.watchingShows.length && true
      }
    })
  }

  handleScroll = throttle(500, () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - SCROLL_THRESHOLD) {
      this.loadNewContent()
      this.loadNewContentLS()
    }
  })

  sortBy = (sortBy) => {
    if (this.state.sortBy === sortBy) return

    this.setState({ sortBy })
  }

  renderContent = (section) => {
    const content = this.context.userContent.userShows
      .filter((show) => {
        if (section === "finishedShows") {
          return show.finished
        } else {
          return show.database === section && !show.finished
        }
      })
      .sort((a, b) =>
        a[this.state.sortBy] > b[this.state.sortBy]
          ? this.state.sortBy === "timeStamp"
            ? -1
            : 1
          : this.state.sortBy !== "timeStamp"
          ? -1
          : 1
      )
      .slice(0, this.state.loadedShows[section])

    const shows = this.context.authUser
      ? content
      : this.context.userContentLocalStorage.watchingShows.slice(0, this.state.loadedShows.watchingShowsLS)

    return (
      <>
        {shows.map((item) => {
          const filteredGenres = item.genre_ids.map((genreId) =>
            listOfGenres.filter((item) => item.id === genreId)
          )

          return (
            <div key={item.id} className="content-results__item content-results__item--shows">
              <div className="content-results__item--shows-wrapper">
                <Link to={`/show/${item.id}`}>
                  <div className="content-results__item-main-info">
                    <div className="content-results__item-title">
                      {!item.name ? "No title available" : item.name}
                    </div>
                    <div className="content-results__item-year">
                      {!item.first_air_date ? "" : `(${item.first_air_date.slice(0, 4)})`}
                    </div>
                    {item.vote_average !== 0 && (
                      <div className="content-results__item-rating">
                        {item.vote_average}
                        <span>/10</span>
                        <span className="content-results__item-rating-vote-count">({item.vote_count})</span>
                      </div>
                    )}
                  </div>
                  <div className="content-results__item-genres">
                    {filteredGenres.map((item) => (
                      <span key={item[0].id}>{item[0].name}</span>
                    ))}
                  </div>
                  <div className="content-results__item-overview">
                    <div className="content-results__item-poster">
                      <div
                        style={
                          item.backdrop_path !== null
                            ? {
                                backgroundImage: `url(https://image.tmdb.org/t/p/w500/${
                                  item.backdrop_path || item.poster_path
                                })`
                              }
                            : {
                                backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
                              }
                        }
                      />
                    </div>
                    <div className="content-results__item-description">
                      {item.overview.length > 150 ? `${item.overview.substring(0, 150)}...` : item.overview}
                    </div>
                  </div>
                </Link>

                {section === "watchingShows" ? (
                  <div className="content-results__item-links content-results__item-links--adv-search">
                    <button
                      className="button"
                      onClick={() => {
                        if (this.context.authUser) {
                          this.context.userContentHandler.handleShowInDatabases({
                            id: item.id,
                            data: item,
                            database: "notWatchingShows",
                            userShows: this.context.userContent.userShows
                          })
                          this.context.userContent.handleUserShowsOnClient({
                            database: "notWatchingShows",
                            id: item.id
                          })
                        } else {
                          this.context.userContentLocalStorage.removeShowLS({
                            id: item.id
                          })
                        }
                      }}
                      type="button"
                    >
                      Not watching
                    </button>
                  </div>
                ) : (
                  section !== "finishedShows" && (
                    <div className="content-results__item-links content-results__item-links--adv-search">
                      <button
                        className="button"
                        onClick={() => {
                          this.context.userContentHandler.handleShowInDatabases({
                            id: item.id,
                            data: item,
                            database: "watchingShows",
                            userShows: this.context.userContent.userShows
                          })
                          this.context.userContent.handleUserShowsOnClient({
                            database: "watchingShows",
                            id: item.id
                          })
                        }}
                        type="button"
                      >
                        Watching
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )
        })}
      </>
    )
  }

  render() {
    const content = this.context.userContent.userShows.filter((show) => {
      if (this.state.activeSection === "finishedShows") {
        return show.finished
      } else {
        return show.database === this.state.activeSection && !show.finished
      }
    })

    const shows = this.context.authUser
      ? content
      : this.state.activeSection === "watchingShows"
      ? this.context.userContentLocalStorage.watchingShows.slice(0, this.state.loadedShows.watchingShowsLS)
      : []

    const maxColumns = 4
    const currentNumOfColumns = shows.length <= maxColumns - 1 ? shows.length : maxColumns

    const loadingShows = this.context.authUser ? this.context.userContent.loadingShows : false

    return (
      <div className="content-results">
        <div className="buttons__row buttons__row--shows-page">
          <div className="buttons__col">
            <button
              className={classNames("button", {
                "button--pressed": this.state.activeSection === "watchingShows"
              })}
              type="button"
              onClick={() => this.toggleSection("watchingShows")}
            >
              Watching
            </button>
          </div>
          <div className="buttons__col">
            <button
              className={classNames("button", {
                "button--pressed": this.state.activeSection === "droppedShows"
              })}
              type="button"
              onClick={() => this.toggleSection("droppedShows")}
            >
              Dropped
            </button>
          </div>
          <div className="buttons__col">
            <button
              className={classNames("button", {
                "button--pressed": this.state.activeSection === "willWatchShows"
              })}
              type="button"
              onClick={() => this.toggleSection("willWatchShows")}
            >
              Will Watch
            </button>
          </div>
          <div className="buttons__col">
            <button
              className={classNames("button", {
                "button--pressed": this.state.activeSection === "finishedShows"
              })}
              type="button"
              onClick={() => this.toggleSection("finishedShows")}
            >
              Finished
            </button>
          </div>
        </div>

        {loadingShows ? (
          <Loader className="loader--pink" />
        ) : shows.length === 0 ? (
          <PlaceholderNoShows authUser={this.context.authUser} activeSection={this.state.activeSection} />
        ) : (
          <>
            {this.context.authUser && (
              <div className="content-results__sortby">
                <div className="content-results__sortby-text">Sort by:</div>
                <div className="content-results__sortby-buttons">
                  <div
                    className={classNames("content-results__sortby-buttons", {
                      "content-results__sortby-button--active": this.state.sortBy === "name"
                    })}
                  >
                    <button
                      type="button"
                      className="button button--sortby-shows"
                      onClick={() => this.sortBy("name", true)}
                    >
                      Alphabetically
                    </button>
                  </div>
                  <div
                    className={classNames("content-results__sortby-button", {
                      "content-results__sortby-button--active": this.state.sortBy === "timeStamp"
                    })}
                  >
                    <button
                      type="button"
                      className="button button--sortby-shows"
                      onClick={() => this.sortBy("timeStamp", true)}
                    >
                      Recently added
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div
              className={classNames("content-results__wrapper", {
                "content-results__wrapper--finished-shows": this.state.activeSection === "finishedShows"
              })}
              style={
                currentNumOfColumns <= 3
                  ? {
                      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 350px))"
                    }
                  : {
                      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"
                    }
              }
            >
              {this.renderContent(this.state.activeSection)}
            </div>
          </>
        )}
      </div>
    )
  }
}

export default ShowsContent
ShowsContent.contextType = AppContext
