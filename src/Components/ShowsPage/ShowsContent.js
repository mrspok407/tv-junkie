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

const SHOW_TO_LOAD_INITIAL = 20
const SCROLL_THRESHOLD = 1400

const TIMEOUT_TO_UPDATE_WATCHING_SHOWS = 500
let timeoutUpdateWatchingShows

class ShowsContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeSection: "watchingShows",
      sortBy: "name",
      initialLoading: true,
      loadingContent: false,
      sortByLoading: false,
      updateWatchingShowsLoading: false,
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
      lastLoadedShow: {
        watchingShows: SHOW_TO_LOAD_INITIAL,
        droppedShows: SHOW_TO_LOAD_INITIAL,
        willWatchShows: SHOW_TO_LOAD_INITIAL,
        finishedShows: SHOW_TO_LOAD_INITIAL
      },
      loadedShows: {
        watchingShows: SHOW_TO_LOAD_INITIAL,
        droppedShows: SHOW_TO_LOAD_INITIAL,
        willWatchShows: SHOW_TO_LOAD_INITIAL,
        finishedShows: SHOW_TO_LOAD_INITIAL
      }
    }
  }

  componentDidMount() {
    this.getContent({ sortBy: "name", isInitialLoad: true })
    window.addEventListener("scroll", this.handleScroll)
  }

  componentWillUnmount() {
    this.props.firebase.userShows(this.props.authUser.uid, "watchingShows").off()
    this.props.firebase.userShows(this.props.authUser.uid, "droppedShows").off()
    this.props.firebase.userShows(this.props.authUser.uid, "willWatchShows").off()
    this.props.firebase.userShows(this.props.authUser.uid, "finishedShows").off()

    window.removeEventListener("scroll", this.handleScroll)
  }

  toggleSection = section => {
    this.setState({
      activeSection: section
    })
  }

  getContent = ({ sortBy = "name", isInitialLoad = true, databases = [] }) => {
    if (this.props.authUser === null || this.state.updateWatchingShowsLoading) return
    if (isInitialLoad) {
      this.setState({ initialLoading: true })
    }

    let counter = 0

    const getContentFromDatabases = databases.length > 0 ? databases : Object.keys(this.state.database)

    getContentFromDatabases.forEach(database => {
      const limitTo = this.state.loadedShows[database] <= 0 ? 1 : this.state.loadedShows[database]

      this.props.firebase
        .userShows(this.props.authUser.uid, database)
        .orderByChild(`finished_and_${sortBy}`)
        .startAt(database !== "finishedShows" ? "false" : "true")
        .endAt(
          database !== "finishedShows" ? "true" : sortBy === "name" ? "true_zzzzzzz" : "true_3190666598976"
        ) // Need zzzzzz's and true_3190666598976 so it will sure go to the end
        .limitToFirst(!isInitialLoad ? limitTo : limitTo)
        .once("value", snapshot => {
          let shows = []
          snapshot.forEach(item => {
            shows = [
              ...shows,
              {
                id: item.val().id,
                finished_and_name: item.val().finished_and_name,
                // name: item.val().name,
                finished_and_timeStamp: item.val().finished_and_timeStamp,
                status: item.val().status
                // timeStamp: item.val().timeStamp
              }
            ]
          })

          Promise.all(
            shows.map(item => {
              const allShowsListSubDatabase = item.status

              return this.props.firebase
                .showInfo(allShowsListSubDatabase, item.id)
                .once("value")
                .then(snapshot => {
                  return snapshot.val()
                })
            })
          ).then(showsData => {
            counter++

            this.setState({
              database: {
                ...this.state.database,
                [database]: showsData
              },
              lastLoadedShow: {
                ...this.state.lastLoadedShow,
                [database]: shows.length !== 0 && shows[shows.length - 1][`finished_and_${sortBy}`]
              }
            })

            if (counter === getContentFromDatabases.length) {
              this.setState({
                sortByLoading: false,
                initialLoading: false
              })
            }
          })
        })
    })
  }

  loadNewContent = () => {
    if (this.props.authUser === null) return
    if (this.state.disableLoad[this.state.activeSection] || this.state.loadingContent) return
    if (document.body.scrollHeight < SCROLL_THRESHOLD) return

    this.setState({
      loadingContent: true
    })

    console.log(this.state.lastLoadedShow[this.state.activeSection])

    this.props.firebase
      .userShows(this.props.authUser.uid, this.state.activeSection)
      .orderByChild(`finished_and_${this.state.sortBy}`)
      .startAt(this.state.lastLoadedShow[this.state.activeSection] + 1)
      .endAt(
        this.state.activeSection !== "finishedShows"
          ? "true"
          : this.state.sortBy === "name"
          ? "true_zzzzzzz"
          : "true_3190666598976"
      ) // Need zzzzzz's and true_3190666598976 so it will sure go to the end
      .limitToFirst(SHOW_TO_LOAD_INITIAL + 1)
      .once("value", snapshot => {
        let shows = []
        snapshot.forEach(item => {
          shows = [
            ...shows,
            {
              id: item.val().id,
              finished_and_name: item.val().finished_and_name,
              finished_and_timeStamp: item.val().finished_and_timeStamp,
              // name: item.val().name,
              // timeStamp: item.val().timeStamp,
              status: item.val().status
            }
          ]
        })

        const disableLoadNewContent = shows.length !== SHOW_TO_LOAD_INITIAL + 1 ? true : false
        if (!disableLoadNewContent) shows.pop()

        Promise.all(
          shows.map(item => {
            const allShowsListSubDatabase = item.status

            return this.props.firebase
              .showInfo(allShowsListSubDatabase, item.id)
              .once("value")
              .then(snapshot => {
                return snapshot.val()
              })
          })
        ).then(showsData => {
          this.setState(prevState => ({
            database: {
              ...prevState.database,
              [this.state.activeSection]: [...prevState.database[this.state.activeSection], ...showsData]
            },
            disableLoad: {
              ...prevState.disableLoad,
              [this.state.activeSection]: disableLoadNewContent
            },
            lastLoadedShow: {
              ...prevState.lastLoadedShow,
              [this.state.activeSection]:
                shows.length !== 0 && shows[shows.length - 1][`finished_and_${this.state.sortBy}`]
            },
            loadedShows: {
              ...prevState.loadedShows,
              [this.state.activeSection]:
                prevState.database[this.state.activeSection].length + showsData.length
            },
            loadingContent: false
          }))
        })
      })
  }

  handleScroll = throttle(500, () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 800) {
      this.loadNewContent()
    }
  })

  handleShowsOnClient = showId => {
    const filteredShows = this.state.database[this.state.activeSection].filter(item => item.id !== showId)

    clearTimeout(timeoutUpdateWatchingShows)

    this.setState({
      database: {
        ...this.state.database,
        [this.state.activeSection]: filteredShows
      }
    })
  }

  updateWatchingShowsDatabase = () => {
    const activeSectionSavedState = this.state.database[this.state.activeSection]
    const watchingShowsSavedState = this.state.database.watchingShows

    if (!this.props.userContent.errorInDatabase.error) {
      timeoutUpdateWatchingShows = setTimeout(() => {
        this.getContent({
          sortBy: this.state.sortBy,
          isInitialLoad: false,
          databases: ["watchingShows", this.state.activeSection]
        })
      }, TIMEOUT_TO_UPDATE_WATCHING_SHOWS)
    } else {
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
                            this.props.handleShowInDatabases({
                              id: item.id,
                              data: item,
                              database: "notWatchingShows",
                              callback: this.updateWatchingShowsDatabase
                            })
                            this.handleShowsOnClient(item.id)
                          } else {
                            this.context.toggleContentLS({
                              id: item.id,
                              type: "watchingShows"
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
                              database: "watchingShows",
                              callback: this.updateWatchingShowsDatabase
                            })
                            this.handleShowsOnClient(item.id)
                          }}
                          type="button"
                        >
                          Watching
                        </button>
                      </div>
                    )
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
