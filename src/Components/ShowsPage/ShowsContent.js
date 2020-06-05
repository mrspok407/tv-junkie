import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { listOfGenres } from "Utils"
import classNames from "classnames"
import PlaceholderNoShows from "Components/Placeholders/PlaceholderNoShows"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"

class ShowsContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeSection: "watchingShows"
    }
  }

  toggleSection = content => {
    this.setState({
      activeSection: content
    })
  }

  renderContent = section => {
    const content =
      section === "watchingShows"
        ? this.props.userContent[section].filter(item => item.userWatching && item)
        : this.props.userContent[section]

    const watchingShows = this.props.authUser
      ? content
      : section !== "watchingShows"
      ? content
      : this.context.watchingShows

    return (
      <>
        {watchingShows.map(
          ({
            name,
            original_name,
            id,
            first_air_date,
            vote_average,
            genre_ids = [],
            overview = "",
            backdrop_path,
            poster_path,
            vote_count
          }) => {
            const filteredGenres = genre_ids.map(genreId => listOfGenres.filter(item => item.id === genreId))

            const showTitle = name || original_name

            return (
              <div key={id} className="content-results__item">
                <Link to={`/show/${id}`}>
                  <div className="content-results__item-main-info">
                    <div className="content-results__item-title">
                      {!showTitle ? "No title available" : showTitle}
                    </div>
                    <div className="content-results__item-year">
                      {!first_air_date ? "" : `(${first_air_date.slice(0, 4)})`}
                    </div>
                    {vote_average !== 0 && (
                      <div className="content-results__item-rating">
                        {vote_average}
                        <span>/10</span>
                        <span className="content-results__item-rating-vote-count">({vote_count})</span>
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
                          backdrop_path !== null
                            ? {
                                backgroundImage: `url(https://image.tmdb.org/t/p/w500/${backdrop_path ||
                                  poster_path})`
                              }
                            : {
                                backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
                              }
                        }
                      />
                    </div>
                    <div className="content-results__item-description">
                      {overview.length > 150 ? `${overview.substring(0, 150)}...` : overview}
                    </div>
                  </div>
                </Link>

                {section === "watchingShows" ? (
                  <div className="content-results__item-links content-results__item-links--adv-search">
                    <button
                      className="button"
                      onClick={() => {
                        if (this.props.authUser) {
                          this.props.removeWatchingShow(id)
                        } else {
                          this.context.toggleContentLS(id, "watchingShows")
                        }
                      }}
                      type="button"
                    >
                      Not watching
                    </button>
                  </div>
                ) : (
                  <div className="content-results__item-links content-results__item-links--adv-search">
                    <button className="button" onClick={() => this.props.addWatchingShow(id)} type="button">
                      Watching
                    </button>
                  </div>
                )}
              </div>
            )
          }
        )}
      </>
    )
  }

  render() {
    const content =
      this.state.activeSection === "watchingShows"
        ? this.props.userContent[this.state.activeSection].filter(item => item.userWatching && item)
        : this.props.userContent[this.state.activeSection]

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
          {watchingShows.length === 0 ? (
            <PlaceholderNoShows
              section={this.state.activeSection}
              authUser={this.props.authUser}
              activeSection={this.state.activeSection}
            />
          ) : (
            this.renderContent(this.state.activeSection)
          )}
        </div>
      </div>
    )
  }
}

export default withUserContent(ShowsContent)

ShowsContent.contextType = UserContentLocalStorageContext
