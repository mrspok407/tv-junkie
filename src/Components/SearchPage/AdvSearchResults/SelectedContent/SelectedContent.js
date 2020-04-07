import React from "react"
import "./SelectedContent.scss"
import { SelectedContentContext } from "../../../Context/SelectedContentContext"

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
    if (
      this.selectedContentRef.current &&
      !this.selectedContentRef.current.contains(e.target)
    ) {
      this.setState({
        showSelected: false
      })
    }
  }

  render() {
    return (
      <div
        ref={this.selectedContentRef}
        className="selected-content__container"
      >
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
            <div className="selected-content__clear">
              <button
                type="button"
                className="button button--clear-selected-content"
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

                return (
                  <div key={id} className="selected-content__item">
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
                    <div className="selected-content__item-info">
                      <div className="selected-content__item-title">
                        {title.length > 65
                          ? `${title.substring(0, 65)}...`
                          : title}
                      </div>
                      <div className="selected-content__item-year">{date}</div>
                      <div className="selected-content__item-overview">
                        {overview && overview.length > 120
                          ? `${overview.substring(0, 120)}...`
                          : overview}
                      </div>
                      <button
                        className="button button--selected-content"
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

MovieResultsSelected.contextType = SelectedContentContext
