import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { listOfGenres } from "Utils"
import { throttle } from "throttle-debounce"
import classNames from "classnames"
import PlaceholderNoShows from "Components/Placeholders/PlaceholderNoShows"
import Loader from "Components/Placeholders/Loader"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"

const showsToLoad = 10

class ShowsContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeSection: "watchingShows",
      watchingShows: [],
      droppedShows: [],
      willWatchShows: [],
      initialLoading: false,
      loadingContent: false,
      watchingShowsDisableLoad: false,
      droppedShowsdisableLoad: false,
      willWatchShowsDisableLoad: false,
      watchingShowsLastLoaded: showsToLoad,
      droppedShowsLastLoaded: showsToLoad,
      willWatchShowsLastLoaded: showsToLoad,
      currentLastShow: showsToLoad
    }
  }

  componentDidMount() {
    this.getContent()
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

    this.props.firebase[this.state.activeSection](this.props.authUser.uid)
      .orderByChild("id")
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
          [`${this.state.activeSection}LastLoaded`]: shows.length !== 0 && shows[shows.length - 1].id,
          [`${this.state.activeSection}DisableLoad`]: shows.length === 0,
          loadingContent: false
        }))
      })
  }

  handleScroll = throttle(500, () => {
    if (this.state[`${this.state.activeSection}DisableLoad`] || this.state.loadingContent) return

    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 800) {
      this.loadNewContent()
    }
  })

  handleShowsOnClient = showId => {
    const activeSectionSavedState = this.state[this.state.activeSection]
    const watchingShowsSavedState = this.state.watchingShows

    const filteredShows = this.state[this.state.activeSection].filter(item => item.id !== showId)
    const deletedShow = this.state[this.state.activeSection].find(item => item.id === showId)

    this.setState({
      [this.state.activeSection]: filteredShows,
      watchingShows:
        this.state.activeSection !== "watchingShows"
          ? [...this.state.watchingShows, deletedShow]
          : filteredShows
    })

    if (this.props.userContent.errorInDatabase.error) {
      this.setState({
        [this.state.activeSection]: activeSectionSavedState,
        watchingShows: watchingShowsSavedState
      })
    }
  }

  getContent = () => {
    if (this.props.authUser === null) return
    this.setState({ initialLoading: true })

    this.props.firebase
      .watchingShows(this.props.authUser.uid)
      .orderByChild("id")
      .limitToFirst(showsToLoad)
      .once("value", snapshot => {
        let watchingShows = []
        snapshot.forEach(item => {
          watchingShows = [...watchingShows, item.val()]
        })

        this.setState({
          watchingShows,
          initialLoading: false,
          watchingShowsLastLoaded: watchingShows.length !== 0 && watchingShows[watchingShows.length - 1].id
        })
      })

    this.props.firebase
      .droppedShows(this.props.authUser.uid)
      .orderByChild("id")
      .limitToFirst(showsToLoad)
      .once("value", snapshot => {
        let droppedShows = []
        snapshot.forEach(item => {
          droppedShows = [...droppedShows, item.val()]
        })

        this.setState({
          droppedShows,
          droppedShowsLastLoaded: droppedShows.length !== 0 && droppedShows[droppedShows.length - 1].id,
          initialLoading: false
        })
      })

    this.props.firebase
      .willWatchShows(this.props.authUser.uid)
      .orderByChild("id")
      .limitToFirst(showsToLoad)
      .once("value", snapshot => {
        let willWatchShows = []
        snapshot.forEach(item => {
          willWatchShows = [...willWatchShows, item.val()]
        })

        this.setState({
          willWatchShows,
          willWatchShowsLastLoaded:
            willWatchShows.length !== 0 && willWatchShows[willWatchShows.length - 1].id,
          initialLoading: false
        })
      })
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
                        this.handleShowsOnClient(item.id)
                        this.props.handleShowInDatabases(item.id, [item], "notWatchingShows")
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
                      this.handleShowsOnClient(item.id)
                      this.props.handleShowInDatabases(item.id, [item], "watchingShows")
                    }}
                    type="button"
                  >
                    Watching
                  </button>
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

    console.log(this.state.activeSection)

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
          ) : watchingShows.length === 0 ? (
            <PlaceholderNoShows
              section={this.state.activeSection}
              authUser={this.props.authUser}
              activeSection={this.state.activeSection}
            />
          ) : (
            <>
              {this.renderContent(this.state.activeSection)}
              {this.state.loadingContent && <Loader className="loader--pink loader--new-page" />}
            </>
          )}
        </div>
      </div>
    )
  }
}

export default withUserContent(ShowsContent, "ShowsContent")

ShowsContent.contextType = UserContentLocalStorageContext
