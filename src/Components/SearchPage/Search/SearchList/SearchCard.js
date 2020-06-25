import React, { Component } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames"
import { withUserContent } from "Components/UserContent"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"

class SearchCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      contentInDatabase: null,
      loadingDataFromDatabase: false
    }
  }

  componentDidMount() {
    this.getContentInDatabase()
  }

  componentWillUnmount() {
    const databases = this.props.userContent.showsDatabases.concat(this.props.userContent.moviesDatabases)

    databases.forEach(item => {
      this.props.firebase[item](this.props.authUser.uid).off()
    })
  }

  getContentInDatabase = () => {
    this.setState({ loadingDataFromDatabase: true })

    const databases = this.props.userContent.showsDatabases.concat(this.props.userContent.moviesDatabases)

    databases.forEach(item => {
      this.props.firebase[item](this.props.authUser.uid)
        .orderByChild("id")
        .equalTo(this.props.id)
        .on("value", snapshot => {
          if (snapshot.val() !== null) {
            // let content = {}

            // Object.keys(snapshot.val()).forEach(key => {
            //   content = { ...snapshot.val()[key], key }
            // })

            this.setState({
              contentInDatabase: item,
              loadingDataFromDatabase: false
            })
          } else {
            if (this.props.movieTitle) {
              this.setState({
                contentInDatabase: null,
                loadingDataFromDatabase: false
              })
            }
            this.setState({
              loadingDataFromDatabase: false
            })
          }
        })
    })
  }

  renderButtons = () => {
    console.log(this.state.contentInDatabase)
    const { searchResults, mediaType } = this.props

    console.log(this.props.mediaType)

    return (
      <div className="search-card__buttons">
        {this.props.movieTitle ? (
          <button
            className={classNames("button button--search-card", {
              "button--pressed": this.state.contentInDatabase === "watchLaterMovies"
            })}
            onClick={() => {
              if (this.props.authUser) {
                this.props.toggleWatchLaterMovie(this.props.id, searchResults, "watchLaterMovies")
              } else {
                this.context.toggleContentLS(this.props.id, "watchLaterMovies", searchResults)
              }

              if (
                !this.state.contentInDatabase === "watchLaterMovies" ||
                this.props.currentlyChosenContent.find(item => item.id === this.props.id)
              ) {
                this.props.toggleCurrentlyChosenContent(this.props.id, searchResults)
              }
            }}
            type="button"
            disabled={this.state.loadingDataFromDatabase}
          >
            {this.state.loadingDataFromDatabase ? (
              <span className="search-card__loading-db"></span>
            ) : this.state.contentInDatabase === "watchLaterMovies" ? (
              "Remove"
            ) : (
              "Watch later"
            )}
          </button>
        ) : (
          <>
            {this.state.contentInDatabase === "watchingShows" ? (
              <button
                className="button button--search-card button--pressed"
                onClick={() => {
                  if (this.props.authUser) {
                    this.props.handleShowInDatabases(this.props.id, searchResults, "notWatchingShows")
                  } else {
                    this.context.toggleContentLS(this.props.id, "watchingShows")
                  }
                }}
                type="button"
                disabled={this.state.loadingDataFromDatabase}
              >
                {this.state.loadingDataFromDatabase ? (
                  <span className="search-card__loading-db"></span>
                ) : (
                  "Not watching"
                )}
              </button>
            ) : (
              <button
                className="button button--search-card"
                onClick={() => {
                  if (this.props.authUser) {
                    this.props.handleShowInDatabases(this.props.id, searchResults, "watchingShows")
                  } else {
                    this.context.toggleContentLS(this.props.id, "watchingShows", searchResults)
                  }

                  this.props.toggleCurrentlyChosenContent(this.props.id, searchResults)
                }}
                type="button"
                disabled={this.state.loadingDataFromDatabase}
              >
                {this.state.loadingDataFromDatabase ? (
                  <span className="search-card__loading-db"></span>
                ) : (
                  "Watching"
                )}
              </button>
            )}
          </>
        )}
      </div>
    )
  }

  render() {
    const {
      movieTitle,
      showTitle,
      personName,
      poster,
      personImage,
      posterBackdrop,
      overview,
      id,
      known_for,
      known_for_department,
      mediaType,
      mediaTypeSearching
    } = this.props

    const type = movieTitle ? "movie" : showTitle && "show"

    return (
      <div
        key={id}
        className={classNames("search-card", {
          "search-card--person": mediaType === "person" || mediaTypeSearching === "person"
        })}
      >
        {mediaType !== "person" && mediaTypeSearching !== "person" ? (
          <>
            <Link className="search-card__image-link" to={`/${type}/${id}`}>
              <div
                className="search-card__image"
                style={
                  poster !== null
                    ? {
                        backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster || posterBackdrop})`
                      }
                    : {
                        backgroundImage: `url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)`
                      }
                }
              />
            </Link>
            <Link className="search-card__info-link" to={`/${type}/${id}`}>
              <div className="search-card__info">
                <div className="search-card__info-title">{movieTitle || showTitle}</div>

                <div className="search-card__info-description">
                  <div className="search-card__info-description--movie">
                    {overview.length > 150 ? `${overview.substring(0, 150)}...` : overview}
                  </div>
                </div>
              </div>
            </Link>
            {this.renderButtons()}
          </>
        ) : (
          <>
            <div
              className="search-card__image"
              style={
                personImage !== null
                  ? {
                      backgroundImage: `url(https://image.tmdb.org/t/p/w500/${personImage})`
                    }
                  : {
                      backgroundImage: `url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)`
                    }
              }
            />
            <div className="search-card__info">
              <div className="search-card__info-title">{movieTitle || showTitle || personName}</div>

              <div className="search-card__info-description">
                {mediaTypeSearching !== "person" && (
                  <div className="search-card__info-description--movie">
                    {overview.length > 150 ? `${overview.substring(0, 150)}...` : overview}
                  </div>
                )}

                <div className="search-card__info-description--person">
                  <div className="search-card__info-activity">Main activity: {known_for_department}</div>
                  <div className="search-card__info-person-movies">
                    {known_for.map((item, i) => {
                      const title =
                        item.media_type === "movie"
                          ? item.original_title || "No title"
                          : item.name || "No title"

                      const releaseDate =
                        item.media_type === "movie" ? item.release_date || "" : item.first_air_date || ""

                      return (
                        <span key={item.id}>
                          {title}
                          {known_for.length - 1 !== i
                            ? ` (${releaseDate.slice(0, 4)}), `
                            : ` (${releaseDate.slice(0, 4)})`}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
}

export default withUserContent(SearchCard)

SearchCard.contextType = UserContentLocalStorageContext
