import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { listOfGenres } from "Utils"
import classNames from "classnames"
import PlaceholderNoShows from "Components/Placeholders/PlaceholderNoShows"
import Loader from "Components/Placeholders/Loader"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"

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
      currentLastShow: 5,
      indexwatchingShows: 20,
      indexdroppedShows: 5,
      indexwillWatchShows: 5
    }
  }

  componentDidMount() {
    this.getContent()
    console.log(this.props)
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

    // this.setState(prevState => ({
    //   [`index${section}`]: prevState[`index${section}`] + 20
    // }))

    this.props.firebase
      .watchingShows(this.props.authUser.uid)
      .orderByChild("userWatching")
      //.equalTo(true)
      .startAt(this.state.currentLastShow)
      // .endAt(this.state.currentLastShow + 5)
      .limitToFirst(5)
      .on("value", snapshot => {
        this.setState(prevState => ({
          currentLastShow: prevState.currentLastShow + 5
        }))

        console.log(snapshot.val())

        const watchingShows = snapshot.val()
          ? Object.keys(snapshot.val()).map(key => ({
              ...snapshot.val()[key]
            }))
          : []

        // console.log(watchingShows.slice(0, 5))

        this.setState(prevState => ({
          watchingShows: [
            ...prevState.watchingShows,
            ...watchingShows.filter(item => item.userWatching === true)
          ],
          disableLoadNewContent: watchingShows.some(item => item.userWatching === false)
        }))
      })
  }

  getContent = () => {
    if (this.props.authUser === null) return
    this.setState({ loadingContent: true })

    this.props.firebase
      .watchingShows(this.props.authUser.uid)
      .orderByChild("userWatching")
      // .equalTo(true)
      .limitToFirst(this.state.currentLastShow)
      .on("value", snapshot => {
        const watchingShows = snapshot.val()
          ? Object.keys(snapshot.val()).map(key => ({
              ...snapshot.val()[key]
            }))
          : []

        console.log(snapshot.val())

        this.setState({
          watchingShows: watchingShows.filter(item => item.userWatching === true),
          // droppedShows: watchingShows.filter(item => item.databases.droppedShows),
          // willWatchShows: watchingShows.filter(item => item.databases.willWatchShows),
          loadingContent: false
        })
      })

    this.props.firebase
      .droppedShows(this.props.authUser.uid)
      .limitToFirst(20)
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
      .limitToFirst(20)
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

    console.log(this.state.currentLastShow)

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
              <div key={item.id} className="content-results__item">
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
                          this.props.removeWatchingShow(item)
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
                      onClick={() => this.props.addWatchingShow(item.id, [], item)}
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
              <button type="button" onClick={() => this.loadNewContent()}>
                Load More
              </button>
            </>
          )}
        </div>
      </div>
    )
  }
}

export default withUserContent(ShowsContent, "ShowsContent")

ShowsContent.contextType = UserContentLocalStorageContext
