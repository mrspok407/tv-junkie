import React from "react"
import { Link } from "react-router-dom"
import "./SelectedContent.scss"
import { withSelectedContextConsumer } from "Components/SelectedContentContext"
import { compose } from "recompose"

class MovieResultsSelected extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      showSelected: false
      // watchingTvShows: []
    }

    this.selectedContentRef = React.createRef()
  }

  componentDidMount() {
    // const firebase = this.props.firebase

    // firebase.auth.onAuthStateChanged(authUser => {
    //   firebase.userWatchingTvShows(authUser.uid).on("value", snapshot => {
    //     const watchingTvShows = snapshot.val() || {}

    //     const watchingTvShowsList = Object.keys(watchingTvShows).map(key => ({
    //       ...watchingTvShows[key],
    //       uid: key
    //     }))

    //     this.setState({
    //       watchingTvShows: watchingTvShowsList
    //     })
    //   })
    // })

    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
    // this.props.firebase.userWatchingTvShows().off()
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  handleClickOutside = e => {
    if (this.selectedContentRef.current && !this.selectedContentRef.current.contains(e.target)) {
      this.setState({
        showSelected: false
      })
    }
  }

  render() {
    const { toggleContent, clearSelectedContent } = this.props.selectedContentState
    return (
      <>
        {this.props.watchingTvShows.length > 0 && (
          <div ref={this.selectedContentRef} className="selected-content__container">
            <button
              type="button"
              className="button--show-selected"
              onClick={() =>
                this.setState(prevState => ({
                  showSelected: !prevState.showSelected
                }))
              }
            >
              {this.props.watchingTvShows.length}
            </button>
            {this.state.showSelected && (
              <div className="selected-content__list">
                <div className="selected-content__button-clear">
                  <button type="button" className="button" onClick={() => clearSelectedContent()}>
                    Clear Selected
                  </button>
                </div>

                {this.props.watchingTvShows.map(
                  ({
                    original_title = "",
                    original_name = "",
                    id,
                    release_date = "",
                    first_air_date = "",
                    poster_path,
                    backdrop_path,
                    overview = ""
                  }) => {
                    const title = original_title || original_name
                    const date = release_date || first_air_date

                    const type = original_title ? "movie" : original_name && "show"

                    return (
                      <div key={id} className="selected-content__item">
                        <Link className="selected-content__item-poster-link" to={`/${type}/${id}`}>
                          <div
                            className="selected-content__item-poster"
                            style={
                              poster_path !== null
                                ? {
                                    backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster_path ||
                                      backdrop_path})`
                                  }
                                : {
                                    backgroundImage: `url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)`
                                  }
                            }
                          />
                        </Link>
                        <Link className="selected-content__item-info-link" to={`/${type}/${id}`}>
                          <div className="selected-content__item-info">
                            <div className="selected-content__item-title">
                              {title.length > 65 ? `${title.substring(0, 65)}...` : title}
                            </div>
                            <div className="selected-content__item-year">{date}</div>
                            <div className="selected-content__item-overview">
                              {overview && overview.length > 120
                                ? `${overview.substring(0, 120)}...`
                                : overview}
                            </div>
                          </div>
                        </Link>
                        <div className="selected-content__item-button">
                          <button className="button" type="button" onClick={() => toggleContent(id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            )}
          </div>
        )}
      </>
    )
  }
}

export default compose(withSelectedContextConsumer)(MovieResultsSelected)
