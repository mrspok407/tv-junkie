import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { listOfGenres } from "Utils"
import { throttle } from "throttle-debounce"
import classNames from "classnames"
import PlaceholderNoShows from "Components/Placeholders/PlaceholderNoShows"
import PlaceholderLoadingContentResultsItem from "Components/Placeholders/PlaceholderLoadingSortBy/PlaceholderLoadingContentResultsItem"
import Loader from "Components/Placeholders/Loader"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"

const showsToLoad = 5

class ShowsContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeSection: "watchingShows",
      sortBy: "name",
      initialLoading: true,
      loadingContent: false,
      sortByLoading: false,
      database: {
        watchingShows: [],
        droppedShows: [],
        willWatchShows: []
      },
      disableLoad: {
        watchingShows: false,
        droppedShows: false,
        willWatchShows: false
      },
      lastLoadedShow: {
        watchingShows: showsToLoad,
        droppedShows: showsToLoad,
        willWatchShows: showsToLoad
      },
      loadedShows: {
        watchingShows: showsToLoad,
        droppedShows: showsToLoad,
        willWatchShows: showsToLoad
      }
    }
  }

  componentDidMount() {
    this.getContent({ sortBy: "name", isInitialLoad: true })
    window.addEventListener("scroll", this.handleScroll)
  }

  componentWillUnmount() {
    this.props.firebase.watchingShows(this.props.authUser.uid).off()
    this.props.firebase.droppedShows(this.props.authUser.uid).off()
    this.props.firebase.willWatchShows(this.props.authUser.uid).off()
    window.removeEventListener("scroll", this.handleScroll)
  }

  toggleSection = section => {
    this.setState({
      activeSection: section
    })
  }

  getContent = ({ sortBy = "name", isInitialLoad = true }) => {
    if (this.props.authUser === null) return
    if (isInitialLoad) {
      this.setState({ initialLoading: true })
    }

    const promises = []

    Object.keys(this.state.database).forEach(database => {
      const promise = this.props.firebase[database](this.props.authUser.uid)
        .orderByChild(sortBy)
        .limitToFirst(this.state.loadedShows[database])
        .once("value", snapshot => {
          let shows = []
          snapshot.forEach(item => {
            shows = [...shows, item.val()]
          })

          console.log(shows)

          this.setState({
            database: {
              ...this.state.database,
              [database]: shows
            },
            lastLoadedShow: {
              ...this.state.lastLoadedShow,
              [database]: shows.length !== 0 && shows[shows.length - 1][sortBy]
            }
          })
        })

      promises.push(promise)
    })

    Promise.all(promises).then(() =>
      this.setState({
        sortByLoading: false,
        initialLoading: false
      })
    )
  }

  loadNewContent = () => {
    if (this.props.authUser === null) return
    this.setState({
      loadingContent: true
    })

    this.props.firebase[this.state.activeSection](this.props.authUser.uid)
      .orderByChild(this.state.sortBy)
      .startAt(this.state.lastLoadedShow[this.state.activeSection] + 1)
      .limitToFirst(showsToLoad)
      .once("value", snapshot => {
        let shows = []
        snapshot.forEach(item => {
          shows = [...shows, item.val()]
        })

        console.log(shows)

        this.setState(prevState => ({
          database: {
            ...prevState.database,
            [this.state.activeSection]: [...prevState.database[this.state.activeSection], ...shows]
          },
          disableLoad: {
            ...prevState.disableLoad,
            [this.state.activeSection]: shows.length === 0
          },
          lastLoadedShow: {
            ...prevState.lastLoadedShow,
            [this.state.activeSection]: shows.length !== 0 && shows[shows.length - 1][this.state.sortBy]
          },
          loadedShows: {
            ...prevState.loadedShows,
            [this.state.activeSection]: prevState.database[this.state.activeSection].length + shows.length
          },
          loadingContent: false
        }))
      })
  }

  handleScroll = throttle(500, () => {
    if (
      this.state.disableLoad[this.state.activeSection] ||
      this.state.loadingContent ||
      document.body.scrollHeight < 1400
    )
      return

    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 100) {
      this.loadNewContent()
    }
  })

  handleShowsOnClient = showId => {
    const filteredShows = this.state.database[this.state.activeSection].filter(item => item.id !== showId)

    this.setState({
      database: {
        ...this.state.database,
        [this.state.activeSection]: filteredShows
      }
    })
    console.log(filteredShows)
  }

  updateWatchingShowsDatabase = () => {
    const activeSectionSavedState = this.state.database[this.state.activeSection]
    const watchingShowsSavedState = this.state.database.watchingShows

    this.props.firebase
      .watchingShows(this.props.authUser.uid)
      .orderByChild(this.state.sortBy)
      .limitToFirst(this.state.loadedShows.watchingShows + 1)
      .once("value", snapshot => {
        let watchingShows = []
        snapshot.forEach(item => {
          watchingShows = [...watchingShows, item.val()]
        })

        console.log(snapshot.val())

        this.setState(prevState => ({
          database: {
            ...this.state.database,
            watchingShows
          },
          lastLoadedShow: {
            ...this.state.lastLoadedShow,
            watchingShows:
              watchingShows.length !== 0 && watchingShows[watchingShows.length - 1][this.state.sortBy]
          },
          loadedShows: {
            ...prevState.loadedShows,
            watchingShows: watchingShows.length
          }
        }))
      })

    if (this.props.userContent.errorInDatabase.error) {
      this.setState({
        database: {
          ...this.state.database,
          [this.state.activeSection]: activeSectionSavedState,
          watchingShows: watchingShowsSavedState
        }
      })
    }
  }

  sortBy = sortBy => {
    if (this.state.sortBy === sortBy) return

    this.setState({ sortBy, sortByLoading: true })
    this.getContent({ sortBy, isInitialLoad: false })
  }

  renderContent = section => {
    const content = this.state.database[section]

    const shows = this.props.authUser
      ? content
      : section !== "watchingShows"
      ? content
      : this.context.watchingShows

    return (
      <>
        {shows.map(item => {
          const filteredGenres = item.genre_ids.map(genreId =>
            listOfGenres.filter(item => item.id === genreId)
          )

          const showTitle = item.name || item.original_name

          return (
            <div key={item.id} className="content-results__item content-results__item--shows">
              {this.state.sortByLoading ? (
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
                            this.props.handleShowInDatabases(
                              item.id,
                              [item],
                              "notWatchingShows",
                              this.updateWatchingShowsDatabase
                            )
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
                          this.props.handleShowInDatabases(
                            item.id,
                            [item],
                            "watchingShows",
                            this.updateWatchingShowsDatabase
                          )
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
    const content = this.state.database[this.state.activeSection]

    const shows = this.props.authUser
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
        ) : shows.length === 0 ? (
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

export default withUserContent(ShowsContent)

ShowsContent.contextType = UserContentLocalStorageContext
