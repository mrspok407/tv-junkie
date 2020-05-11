import React from "react"
import { Link } from "react-router-dom"
import "./SelectedContent.scss"
import { Context } from "../../../Context/Context"

export default class MovieResultsSelected extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      showSelected: false
    }

    this.selectedContentRef = React.createRef()
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
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
    return (
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
          {this.context.selectedContent.length}
        </button>
        {this.state.showSelected && (
          <div className="selected-content__list">
            <div className="selected-content__button-clear">
              <button
                type="button"
                className="button"
                onClick={() => this.context.clearSelectedContent()}
              >
                Clear Selected
              </button>
            </div>

            {this.context.selectedContent.map(
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
                      <button
                        className="button"
                        type="button"
                        onClick={() => this.context.toggleContent(id)}
                      >
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
    )
  }
}

MovieResultsSelected.contextType = Context
