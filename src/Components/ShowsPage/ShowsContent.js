import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { listOfGenres } from "Utils"
import classNames from "classnames"
import PlaceholderNoShows from "Components/Placeholders/PlaceholderNoShows"
import Loader from "Components/Placeholders/Loader"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"

const showsToLoad = 6

class ShowsContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeSection: "watchingShows",
      watchingShows: [],
      droppedShows: [],
      willWatchShows: [],
      loadingContent: false,
      disableLoadNewContent: false,
      currentLastShow: showsToLoad,
      indexwatchingShows: 20,
      indexdroppedShows: 5,
      indexwillWatchShows: 5
    }
  }

  componentDidMount() {
    this.getContent()
    this.test()
  }

  componentWillUnmount() {
    this.props.firebase.watchingShows(this.props.authUser.uid).off()
    this.props.firebase.droppedShows(this.props.authUser.uid).off()
    this.props.firebase.willWatchShows(this.props.authUser.uid).off()
  }

  toggleSection = content => {
    this.setState({
      activeSection: content
    })
  }

  loadNewContent = () => {
    if (this.props.authUser === null) return
    if (this.state.disableLoadNewContent) return

    this.props.firebase
      .watchingShows(this.props.authUser.uid)
      .orderByChild("id")
      .startAt(this.state.currentLastShow + 1)
      .limitToFirst(showsToLoad)
      .once("value", snapshot => {
        let watchingShows = []
        snapshot.forEach(item => {
          watchingShows = [...watchingShows, item.val()]
        })

        this.setState(prevState => ({
          watchingShows: [...prevState.watchingShows, ...watchingShows],
          currentLastShow: watchingShows.length !== 0 && watchingShows[watchingShows.length - 1].id,
          disableLoadNewContent: watchingShows.length === 0
        }))
      })
  }

  test = () => {
    this.props.firebase
      .watchingShows(this.props.authUser.uid)
      .orderByChild("id")
      .on("child_removed", snapshot => {
        const watchingShows = this.state.watchingShows.filter(item => item.id !== snapshot.val().id)

        this.setState({
          watchingShows
        })
      })
  }

  getContent = () => {
    if (this.props.authUser === null) return
    this.setState({ loadingContent: true })

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
          loadingContent: false,
          currentLastShow: watchingShows.length !== 0 && watchingShows[watchingShows.length - 1].id
        })
      })

    this.props.firebase
      .droppedShows(this.props.authUser.uid)
      .limitToFirst(showsToLoad)
      .on("value", snapshot => {
        const droppedShows = snapshot.val()
          ? Object.keys(snapshot.val()).map(key => ({
              ...snapshot.val()[key]
            }))
          : []

        this.setState({
          droppedShows,
          loadingContent: false
        })
      })

    this.props.firebase
      .willWatchShows(this.props.authUser.uid)
      .limitToFirst(showsToLoad)
      .on("value", snapshot => {
        const willWatchShows = snapshot.val()
          ? Object.keys(snapshot.val()).map(key => ({
              ...snapshot.val()[key]
            }))
          : []

        this.setState({
          willWatchShows,
          loadingContent: false
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

    console.log(watchingShows)

    return (
      <>
        {watchingShows.map((item, index) => {
          // if (index >= this.state[`index${section}`]) return

          const filteredGenres = item.genre_ids.map(genreId =>
            listOfGenres.filter(item => item.id === genreId)
          )

          const showTitle = item.name || item.original_name

          return (
            <>
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
                      onClick={() => this.props.handleShowInDatabases(item.id, [item], "watchingShows")}
                      type="button"
                    >
                      Watching
                    </button>
                  </div>
                )}
              </div>
            </>
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
          {this.state.loadingContent ? (
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
              {!this.state.disableLoadNewContent && (
                <button type="button" onClick={() => this.loadNewContent()}>
                  Load More
                </button>
              )}
            </>
          )}
        </div>
      </div>
    )
  }
}

export default withUserContent(ShowsContent, "ShowsContent")

ShowsContent.contextType = UserContentLocalStorageContext
