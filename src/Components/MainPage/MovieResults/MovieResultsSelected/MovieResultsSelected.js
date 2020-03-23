import React from "react"
import "./MovieResultsSelected.scss"

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
    const { selectedMovies, toggleMovie, clearSelectedMovies } = this.props
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
          {selectedMovies.length}
        </button>
        {this.state.showSelected && (
          <div className="selected-content__list">
            <div className="selected-content__clear">
              <button
                type="button"
                className="button button--clear-selected-content"
                onClick={() => clearSelectedMovies()}
              >
                Clear Selected
              </button>
            </div>

            {selectedMovies.map(
              ({ title, id, release_date, poster_path, overview }) => (
                <div key={id} className="selected-content__item">
                  <div
                    className="selected-content__item-poster"
                    style={{
                      backgroundImage: `url(https://image.tmdb.org/t/p/w200${poster_path})`
                    }}
                  />
                  <div className="selected-content__item-info">
                    <div className="selected-content__item-title">
                      {title.length > 65
                        ? `${title.substring(0, 65)}...`
                        : title}
                    </div>
                    <div className="selected-content__item-year">
                      {release_date}
                    </div>
                    <div className="selected-content__item-overview">
                      {overview.length > 120
                        ? `${overview.substring(0, 120)}...`
                        : overview}
                    </div>
                    <button
                      className="button button--selected-content"
                      type="button"
                      onClick={() => toggleMovie(id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    )
  }
}
