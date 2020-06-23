import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { listOfGenres } from "Utils"
import { throttle } from "throttle-debounce"
import classNames from "classnames"
import PlaceholderNoShows from "Components/Placeholders/PlaceholderNoShows"
import Loader from "Components/Placeholders/Loader"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"
import PlaceholderLoadingContentResultsItem from "Components/Placeholders/PlaceholderLoadingSortBy/PlaceholderLoadingContentResultsItem"

const showsToLoad = 5

class ShowsContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeSection: "watchingShows",
      watchingShows: [],
      droppedShows: [],
      willWatchShows: [],
      initialLoading: true,
      loadingContent: false,
      watchingShowsDisableLoad: false,
      droppedShowsdisableLoad: false,
      willWatchShowsDisableLoad: false,
      watchingShowsLastLoaded: showsToLoad,
      droppedShowsLastLoaded: showsToLoad,
      willWatchShowsLastLoaded: showsToLoad,
      currentLastShow: showsToLoad,
      watchingShowsNumOfLoadedShows: showsToLoad,
      droppedShowsNumOfLoadedShows: showsToLoad,
      willWatchShowsNumOfLoadedShows: showsToLoad,
      sortByShows: "name",
      sortByShowsLoading: false
    }
  }

  componentDidMount() {
    this.getContent({ sortByShows: "name", isInitialLoad: true })
    window.addEventListener("scroll", this.handleScroll)
  }

  componentWillUnmount() {
    this.props.firebase.watchingShows(this.props.authUser.uid).off()
    this.props.firebase.droppedShows(this.props.authUser.uid).off()
    this.props.firebase.willWatchShows(this.props.authUser.uid).off()
    window.removeEventListener("scroll", this.handleScroll)
  }

  toggleSection = content => {
    this.setState({
      activeSection: content
    })
  }

  loadNewContent = () => {
    if (this.props.authUser === null) return
    this.setState({
      loadingContent: true
    })

    console.log(this.state[`${this.state.activeSection}LastLoaded`])

    this.props.firebase[this.state.activeSection](this.props.authUser.uid)
      .orderByChild(this.state.sortByShows)
      .startAt(this.state[`${this.state.activeSection}LastLoaded`] + 1)
      .limitToFirst(showsToLoad)
      .once("value", snapshot => {
        let shows = []
        snapshot.forEach(item => {
          shows = [...shows, item.val()]
        })

        console.log(shows)

        this.setState(prevState => ({
          [this.state.activeSection]: [...prevState[this.state.activeSection], ...shows],
          [`${this.state.activeSection}LastLoaded`]:
            shows.length !== 0 && shows[shows.length - 1][this.state.sortByShows],
          [`${this.state.activeSection}DisableLoad`]: shows.length === 0,
          [`${this.state.activeSection}NumOfLoadedShows`]:
            prevState[this.state.activeSection].length + shows.length,
          loadingContent: false
        }))
      })
  }

  handleScroll = throttle(500, () => {
    if (
      this.state[`${this.state.activeSection}DisableLoad`] ||
      this.state.loadingContent ||
      document.body.scrollHeight < 1400
    )
      return

    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 100) {
      this.loadNewContent()
    }
  })

  handleShowsOnClient = showId => {
    const activeSectionSavedState = this.state[this.state.activeSection]
    const watchingShowsSavedState = this.state.watchingShows

    const filteredShows = this.state[this.state.activeSection].filter(item => item.id !== showId)
    // const deletedShow = this.state[this.state.activeSection].find(item => item.id === showId)

    this.setState({
      [this.state.activeSection]: filteredShows
      // watchingShows:
      //   this.state.activeSection !== "watchingShows"
      //     ? [...this.state.watchingShows, deletedShow]
      //     : filteredShows
    })

    this.props.firebase
      .watchingShows(this.props.authUser.uid)
      .orderByChild(this.state.sortByShows)
      .limitToFirst(this.state.watchingShowsNumOfLoadedShows)
      .once("value", snapshot => {
        let watchingShows = []
        snapshot.forEach(item => {
          watchingShows = [...watchingShows, item.val()]
        })

        this.setState({
          watchingShows,
          watchingShowsLastLoaded:
            watchingShows.length !== 0 && watchingShows[watchingShows.length - 1][this.state.sortByShows]
        })
      })

    if (this.props.userContent.errorInDatabase.error) {
      this.setState({
        [this.state.activeSection]: activeSectionSavedState,
        watchingShows: watchingShowsSavedState
      })
    }
  }

  getContent = ({ sortByShows = "name", isInitialLoad = true }) => {
    console.log("test")
    if (this.props.authUser === null) return
    if (isInitialLoad) {
      this.setState({ initialLoading: true })
    }

    const promiseWatchingShows = this.props.firebase
      .watchingShows(this.props.authUser.uid)
      .orderByChild(sortByShows)
      .limitToFirst(this.state.watchingShowsNumOfLoadedShows)
      .once("value", snapshot => {
        let watchingShows = []
        snapshot.forEach(item => {
          watchingShows = [...watchingShows, item.val()]
        })

        this.setState({
          watchingShows,
          watchingShowsLastLoaded:
            watchingShows.length !== 0 && watchingShows[watchingShows.length - 1][sortByShows]
        })
      })

    const promiseDroppedShows = this.props.firebase
      .droppedShows(this.props.authUser.uid)
      .orderByChild(sortByShows)
      .limitToFirst(this.state.droppedShowsNumOfLoadedShows)
      .once("value", snapshot => {
        let droppedShows = []
        snapshot.forEach(item => {
          droppedShows = [...droppedShows, item.val()]
        })

        this.setState({
          droppedShows,
          droppedShowsLastLoaded:
            droppedShows.length !== 0 && droppedShows[droppedShows.length - 1][sortByShows]
        })
      })

    const promiseWillWatchShows = this.props.firebase
      .willWatchShows(this.props.authUser.uid)
      .orderByChild(sortByShows)
      .limitToFirst(this.state.willWatchShowsNumOfLoadedShows)
      .once("value", snapshot => {
        let willWatchShows = []
        snapshot.forEach(item => {
          willWatchShows = [...willWatchShows, item.val()]
        })

        this.setState({
          willWatchShows,
          willWatchShowsLastLoaded:
            willWatchShows.length !== 0 && willWatchShows[willWatchShows.length - 1][sortByShows]
        })
      })

    Promise.all([promiseWatchingShows, promiseDroppedShows, promiseWillWatchShows]).then(() =>
      this.setState({
        sortByShowsLoading: false,
        initialLoading: false
      })
    )
  }

  sortByShows = sortByShows => {
    if (this.state.sortByShows === sortByShows) return
    console.log(sortByShows)

    this.setState({ sortByShows, sortByShowsLoading: true })
    this.getContent({ sortByShows, isInitialLoad: false })
  }

  renderContent = section => {
    const content = this.state[section]

    const watchingShows = this.props.authUser
      ? content
      : section !== "watchingShows"
      ? content
      : this.context.watchingShows

    return (
      <>
        {watchingShows.map(item => {
          const filteredGenres = item.genre_ids.map(genreId =>
            listOfGenres.filter(item => item.id === genreId)
          )

          const showTitle = item.name || item.original_name

          return (
            <div key={item.id} className="content-results__item content-results__item--shows">
              {this.state.sortByShowsLoading ? (
                <PlaceholderLoadingContentResultsItem delayAnimation="0.5s" />
              ) : (
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
                            this.props.handleShowInDatabases(item.id, [item], "notWatchingShows")
                            this.handleShowsOnClient(item.id)
                          } else {
                            this.context.toggleContentLS(item.id, "watchingShows")
                          }
                        }}
                        type="button"
                      >
                        Not watching
                      </button>
                    </div>
                  ) : (
                    <div className="content-results__item-links content-results__item-links--adv-search">
                      <button
                        className="button"
                        onClick={() => {
                          this.props.handleShowInDatabases(item.id, [item], "watchingShows")
                          this.handleShowsOnClient(item.id)
                        }}
                        type="button"
                      >
                        Watching
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </>
    )
  }

  render() {
    const content = this.state[this.state.activeSection]

    const watchingShows = this.props.authUser
      ? content
      : this.state.activeSection !== "watchingShows"
      ? content
      : this.context.watchingShows

    const maxColumns = 4
    const currentNumOfColumns = content.length <= maxColumns - 1 ? content.length : maxColumns

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
        </div>

        {this.state.initialLoading ? (
          <Loader className="loader--pink" />
        ) : watchingShows.length === 0 ? (
          <PlaceholderNoShows
            section={this.state.activeSection}
            authUser={this.props.authUser}
            activeSection={this.state.activeSection}
          />
        ) : (
          <>
            <div className="content-results__sortby">
              <div className="content-results__sortby-text">Sort by:</div>
              <div className="content-results__sortby-buttons">
                <div
                  className={classNames("content-results__sortby-buttons", {
                    "content-results__sortby-button--active": this.state.sortByShows === "name"
                  })}
                >
                  <button
                    type="button"
                    className="button button--sortby-shows"
                    onClick={() => this.sortByShows("name", true)}
                  >
                    Alphabetically
                  </button>
                </div>
                <div
                  className={classNames("content-results__sortby-button", {
                    "content-results__sortby-button--active": this.state.sortByShows === "timeStamp"
                  })}
                >
                  <button
                    type="button"
                    className="button button--sortby-shows"
                    onClick={() => this.sortByShows("timeStamp", true)}
                  >
                    Recently added
                  </button>
                </div>
              </div>
            </div>
            <div
              className="content-results__wrapper"
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
                <>
                  {this.renderContent(this.state.activeSection)}
                  {this.state.loadingContent && <Loader className="loader--pink loader--new-page" />}
                </>
              )}
            </div>
          </>
        )}
      </div>
    )
  }
}

export default withUserContent(ShowsContent, "ShowsContent")

ShowsContent.contextType = UserContentLocalStorageContext
