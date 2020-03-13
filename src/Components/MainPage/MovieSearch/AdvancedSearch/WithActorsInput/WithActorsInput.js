import React, { Component } from "react"
import debounce from "debounce"
import axios, { CancelToken } from "axios"
import Placeholder from "../../Placeholders/PlaceholderSearching"
import PlaceholderNoResults from "../../Placeholders/PlaceholderNoResults"

let cancelRequest

export default class WithActorsInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      query: "",
      actors: [],
      isSearchingActors: false,
      totalPages: null,
      error: "",
      listIsOpen: false
    }

    this.searchContRef = React.createRef()
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside)
    this.runSearch()
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  handleSearch = query => {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }

    if (!query)
      return this.setState({ actors: [], isSearchingActors: false, error: "" })

    this.setState({ error: "", isSearchingActors: true })
    const { API_KEY } = this.props
    axios
      .get(
        `https://api.tmdb.org/3/search/person?api_key=${API_KEY}&query=${query}`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
      .then(({ data: { results: actors, total_pages: totalPages } }) => {
        this.setState({
          actors,
          isSearchingActors: false,
          totalPages
        })
        // if (movies.length > 0) {
        //   this.setState({
        //     listIsOpen: true
        //   })
        // } else {
        //   this.setState({
        //     listIsOpen: false
        //   })
        // }
      })
      .catch(err => {
        if (axios.isCancel(err)) return
        this.setState({
          actors: [],
          isSearchingActors: false,
          error: "Something went wrong"
        })
      })
  }

  runSearch = () => this.handleSearch(this.state.query)

  runSearchDeb = debounce(() => this.handleSearch(this.state.query), 300)

  resetSearch = () => this.setState({ query: "" }, this.runSearch)

  handleKeyDown = e => e.which === 27 && this.resetSearch()

  handleChange = e => {
    this.setState({ query: e.target.value }, this.runSearchDeb)
  }

  renderActors = () => {
    const { actors } = this.state
    const { toggleActor, withActors } = this.props
    return !Array.isArray(actors) ? (
      <div className="error">
        <p>Something gone terrible wrong</p>
      </div>
    ) : (
      actors.map(({ name, id, profile_path }) => (
        <div key={id} className="actors-wrapper">
          <div
            className="actors-photo"
            style={
              profile_path !== null
                ? {
                    backgroundImage: `url(https://image.tmdb.org/t/p/w500/${profile_path.substring(
                      1
                    )})`
                  }
                : {
                    backgroundImage: `url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)`
                  }
            }
          />
          <div className="actors-info">
            <div className="actors-name">{name}</div>
            <div className="actors-button">
              {withActors.some(e => e.id === id) ? (
                <button
                  className="button button--actors button--pressed"
                  onClick={() => toggleActor(id, name)}
                  type="button"
                >
                  Remove
                </button>
              ) : (
                <button
                  className="button button--actors"
                  onClick={() => toggleActor(id, name)}
                  type="button"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      ))
    )
  }

  handleClickOutside = e => {
    if (
      this.searchContRef.current &&
      !this.searchContRef.current.contains(e.target)
    ) {
      this.setState({
        listIsOpen: false
      })
    }
  }

  onFocus = () => {
    this.setState({
      listIsOpen: true
    })
  }

  render() {
    const { listIsOpen, isSearchingActors, query, totalPages } = this.state
    const { withActors, toggleActor } = this.props

    return (
      <div ref={this.searchContRef} className="with-actors-input__cont">
        <div className="actors-input">
          <input
            type="text"
            placeholder="With actors"
            value={this.state.query}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            onFocus={this.onFocus}
          />
          <button
            type="button"
            className="input-clear input-clear--actors"
            onClick={this.resetSearch}
          />
        </div>
        {totalPages === 0 && query !== "" ? (
          <PlaceholderNoResults
            message="No actors found"
            className="placeholder--no-results-actors"
          />
        ) : isSearchingActors ? (
          <Placeholder className="placeholder--actors-search" />
        ) : (
          listIsOpen && <div className="actors-list">{this.renderActors()}</div>
        )}
        <div className="actors-added">
          {withActors.map(item => (
            <div key={item.id} className="actors-added__actor">
              {item.name}
              <button
                className="input-clear input-clear--del-actor"
                type="button"
                onClick={() => toggleActor(item.id, item.name)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }
}
