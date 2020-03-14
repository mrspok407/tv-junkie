import React, { Component } from "react"
import debounce from "debounce"
import axios, { CancelToken } from "axios"
import MovieList from "./MovieList/MovieList"
import Input from "./Input/Input"
import Placeholder from "./Placeholders/PlaceholderSearching"
import AdvancedSearch from "./AdvancedSearch/AdvancedSearch"
import "./styles.scss"
import PlaceholderNoResults from "./Placeholders/PlaceholderNoResults"

let cancelRequest

export default class MovieSearch extends Component {
  constructor(props) {
    super(props)
    this.state = {
      query: "",
      movies: [],
      isSearchingList: false,
      totalPages: null,
      listIsOpen: false,
      error: "",
      date: 2010
    }

    this.searchContRef = React.createRef()
  }

  handleSearch = query => {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }

    if (!query)
      return this.setState({ movies: [], isSearchingList: false, error: "" })

    this.setState({ error: "", isSearchingList: true })

    const { API_KEY } = this.props

    axios
      .get(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
      .then(({ data: { results: movies, total_pages: totalPages } }) => {
        this.setState({
          movies,
          isSearchingList: false,
          totalPages
        })
        if (movies.length > 0) {
          this.setState({
            listIsOpen: true
          })
        } else {
          this.setState({
            listIsOpen: false
          })
        }
      })
      .catch(err => {
        if (axios.isCancel(err)) return
        this.setState({
          movies: [],
          isSearchingList: false,
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

  renderMovies = list => {
    const { movies, error } = this.state
    return error || !Array.isArray(movies) ? (
      <div className="error">
        <p>{error || "Something gone terrible wrong"}</p>
      </div>
    ) : (
      list
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
    const {
      query,
      movies,
      isSearchingList,
      totalPages,
      listIsOpen
    } = this.state
    const {
      selectedMovies,
      toggleMovie,
      randomMovies,
      toggleActor,
      withActors,
      clearWithActors
    } = this.props

    return (
      <div className="movie-search">
        <div ref={this.searchContRef} className="movie-search__cont">
          <Input
            query={query}
            handleChange={this.handleChange}
            resetSearch={this.handleKeyDown}
            resetSearchBtn={this.resetSearch}
            onFocus={this.onFocus}
          />
          <div className="movie-search__random">
            <button
              className="button button--random-search"
              type="button"
              onClick={() => randomMovies()}
            >
              Random movies
            </button>
          </div>

          <AdvancedSearch
            advancedSearch={this.props.advancedSearch}
            API_KEY={this.props.API_KEY}
            toggleActor={toggleActor}
            withActors={withActors}
            clearWithActors={clearWithActors}
          />
          <div className="movie-search__movie-list">
            {totalPages === 0 && query !== "" ? (
              <PlaceholderNoResults message="No movies found" />
            ) : isSearchingList ? (
              <Placeholder />
            ) : (
              listIsOpen &&
              this.renderMovies(
                <MovieList
                  movies={movies}
                  selectedMovies={selectedMovies}
                  toggleMovie={toggleMovie}
                  handleClickOutside={this.handleClickOutside}
                  cancelSource={this.cancelSource}
                />
              )
            )}
          </div>
        </div>
      </div>
    )
  }
}
