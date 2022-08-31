/* eslint-disable max-len */
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import debounce from 'debounce'
import axios, { CancelToken } from 'axios'
import Loader from 'Components/UI/Placeholders/Loader'
import PlaceholderNoResults from 'Components/UI/Placeholders/PlaceholderNoResults'

let cancelRequest

export default class WithActorsInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      query: '',
      actors: [],
      isSearchingActors: false,
      totalPages: null,
      error: '',
      listIsOpen: false,
    }

    this.searchContRef = React.createRef()
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleSearch = (query) => {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }

    if (!query) return this.setState({ actors: [], isSearchingActors: false, error: '' })

    this.setState({ error: '', isSearchingActors: true })
    axios
      .get(`https://api.tmdb.org/3/search/person?api_key=${process.env.REACT_APP_TMDB_API}&query=${query}`, {
        cancelToken: new CancelToken((c) => {
          cancelRequest = c
        }),
      })
      .then(({ data: { results: actors, total_pages: totalPages } }) => {
        this.setState({
          actors,
          isSearchingActors: false,
          totalPages,
        })
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        this.setState({
          actors: [],
          isSearchingActors: false,
          error: 'Something went wrong',
        })
      })
  }

  runSearch = () => this.handleSearch(this.state.query)

  runSearchDeb = debounce(() => this.handleSearch(this.state.query), 300)

  resetSearch = () => this.setState({ query: '' }, this.runSearch)

  handleKeyDown = (e) => e.which === 27 && this.resetSearch()

  handleChange = (e) => {
    this.setState({ query: e.target.value }, this.runSearchDeb)
  }

  handleClickOutside = (e) => {
    if (this.searchContRef.current && !this.searchContRef.current.contains(e.target)) {
      this.setState({
        listIsOpen: false,
      })
    }
  }

  onFocus = () => {
    this.setState({
      listIsOpen: true,
    })
  }

  renderActors = () => {
    const { actors, error } = this.state
    const { toggleActor, withActors } = this.props
    return error || !Array.isArray(actors) ? (
      <div className="error">
        <p>{error || 'Something gone terrible wrong'}</p>
      </div>
    ) : (
      actors.map(({ name, profile_path, id, known_for, known_for_department }) => (
        <div key={id} className="search-card search-card--person search-card--with-actors">
          <div className="search-card__info search-card__info--person">
            <div
              className="search-card__info-image"
              style={
                profile_path !== null
                  ? {
                      backgroundImage: `url(https://image.tmdb.org/t/p/w500/${profile_path})`,
                    }
                  : {
                      backgroundImage: 'url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)',
                    }
              }
            />
            <div className="search-card__info-name">{name}</div>
            <div className="search-card__info-activity">
              Main activity:
              {known_for_department}
            </div>
            <div className="search-card__info-known-movies">
              {known_for.map((item, i) => {
                const mediaType = item.media_type === 'movie' ? 'movie' : 'show'

                const title = item.media_type === 'movie' ? item.original_title || 'No title' : item.name || 'No title'

                const releaseDate = item.media_type === 'movie' ? item.release_date || '' : item.first_air_date || ''

                return (
                  <span key={item.id}>
                    <Link className="search-card__info-link" to={`/${mediaType}/${item.id}`}>
                      {title}
                    </Link>

                    {known_for.length - 1 !== i ? ` (${releaseDate.slice(0, 4)}), ` : ` (${releaseDate.slice(0, 4)})`}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="search-card__buttons search-card__buttons--person">
            {withActors.some((e) => e.id === id) ? (
              <button
                className="button button--searchlist button--pressed"
                onClick={() => toggleActor(id, name)}
                type="button"
              >
                Remove
              </button>
            ) : (
              <button
                className="button button--searchlist"
                onClick={() => {
                  toggleActor(id, name)
                  this.setState({ listIsOpen: false })
                }}
                type="button"
              >
                Add
              </button>
            )}
          </div>
        </div>
      ))
    )
  }

  render() {
    return (
      <div ref={this.searchContRef} className="inputs__with-actors">
        <div className="search__input-cont">
          <div className="search__search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ipc-icon ipc-icon--magnify"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="presentation"
            >
              <path fill="none" d="M0 0h24v24H0V0z" />
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>

          <input
            ref={(_input) => {
              this.inputRef = _input
            }}
            className="search__input search__input--with-actors"
            type="text"
            placeholder="With actors"
            value={this.state.query}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            onFocus={this.onFocus}
          />
          {this.state.isSearchingActors && <Loader className="loader--small-pink" />}
          {this.state.query && <button type="button" className="button--input-clear" onClick={this.resetSearch} />}
        </div>
        {this.state.totalPages === 0 && this.state.query !== '' && this.state.listIsOpen ? (
          <PlaceholderNoResults message="No results found" handleClickOutside={this.handleClickOutside} />
        ) : (
          this.state.listIsOpen && <div className="search-list search-list--with-actors">{this.renderActors()}</div>
        )}
        <div className="actors-added">
          {this.props.withActors.map((item) => (
            <div key={item.id} className="actors-added__actor">
              {item.name}
              <button
                className="button--input-clear button--input-clear__withactors"
                type="button"
                onClick={() => this.props.toggleActor(item.id, item.name)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }
}
