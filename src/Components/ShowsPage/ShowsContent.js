import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { listOfGenres } from "Utils"
import { throttle } from "throttle-debounce"
import classNames from "classnames"
import PlaceholderNoShows from "Components/Placeholders/PlaceholderNoShows"
import Loader from "Components/Placeholders/Loader"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"

const SHOWS_TO_LOAD_INITIAL = 15
const SCROLL_THRESHOLD = 800

class ShowsContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeSection: "watchingShows",
      sortBy: "name",
      database: {
        watchingShows: [],
        droppedShows: [],
        willWatchShows: [],
        finishedShows: []
      },
      disableLoad: {
        watchingShows: false,
        droppedShows: false,
        willWatchShows: false,
        finishedShows: false
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

  toggleSection = section => {
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
            this.props.userContent.userShowsDatabases[this.state.activeSection].length && true
      }
    })
  }

  loadNewContentLS = () => {
    this.setState({
      loadedShows: {
        ...this.state.loadedShows,
        watchingShowsLS: this.state.loadedShows.watchingShowsLS + 5
      }
    })
  }

  handleScroll = throttle(500, () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - SCROLL_THRESHOLD) {
      this.loadNewContent()
      this.loadNewContentLS()
    }
  })

  sortBy = sortBy => {
    if (this.state.sortBy === sortBy) return

    this.setState({ sortBy })
  }

  renderContent = section => {
    const content = this.props.userContent.userShowsDatabases[this.state.activeSection]
      .sort((a, b) => (a[this.state.sortBy] > b[this.state.sortBy] ? 1 : -1))
      .slice(0, this.state.loadedShows[section])

    const shows = this.props.authUser
      ? content
      : section !== "watchingShows"
      ? content
      : this.context.watchingShows.slice(0, this.state.loadedShows.watchingShowsLS)

    return (
      <>
        {shows.map(item => {
          const filteredGenres = item.genre_ids.map(genreId =>
            listOfGenres.filter(item => item.id === genreId)
          )

          const showTitle = item.name || item.original_name

          return (
            <div key={item.id} className="content-results__item content-results__item--shows">
              <div className="content-results__item--shows-wrapper">
                <Link to={`/show/${item.id}`}>
                  <div className="content-results__item-main-info">
                    <div className="content-results__item-title">
                      {!showTitle ? "No title available" : showTitle}
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
                    {filteredGenres.map(item => (
                      <span key={item[0].id}>{item[0].name}</span>
                    ))}
                  </div>
                  <div className="content-results__item-overview">
                    <div className="content-results__item-poster">
                      <div
                        style={
                          item.backdrop_path !== null
                            ? {
                                backgroundImage: `url(https://image.tmdb.org/t/p/w500/${item.backdrop_path ||
                                  item.poster_path})`
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
                        if (this.props.authUser) {
                          this.props.handleShowInDatabases({
                            id: item.id,
                            data: item,
                            database: "notWatchingShows"
                          })
                          this.props.handleShowsListenerOnClient({
                            activeSection: this.state.activeSection,
                            id: item.id
                          })
                        } else {
                          this.context.removeShowLS({
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
                          this.props.handleShowInDatabases({
                            id: item.id,
                            data: item,
                            database: "watchingShows"
                          })
                          this.props.handleShowsListenerOnClient({
                            activeSection: this.state.activeSection,
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
    const content = this.props.userContent.userShowsDatabases[this.state.activeSection]

    const shows = this.props.authUser
      ? content
      : this.state.activeSection !== "watchingShows"
      ? content
      : this.context.watchingShows.slice(0, this.state.loadedShows.watchingShowsLS)

    const maxColumns = 4
    const currentNumOfColumns = shows.length <= maxColumns - 1 ? shows.length : maxColumns

    const loadingShows = this.props.authUser ? this.props.userContent.loadingShows : false

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
          <PlaceholderNoShows
            section={this.state.activeSection}
            authUser={this.props.authUser}
            activeSection={this.state.activeSection}
          />
        ) : (
          <>
            {this.props.authUser && (
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
              {this.state.initialLoading ? (
                <Loader className="loader--pink" />
              ) : (
                this.renderContent(this.state.activeSection)
              )}
            </div>
          </>
        )}
      </div>
    )
  }
}

export default withUserContent(ShowsContent)

ShowsContent.contextType = UserContentLocalStorageContext
