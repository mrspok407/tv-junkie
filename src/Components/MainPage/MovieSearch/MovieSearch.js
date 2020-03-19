import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import MovieList from "./MovieList/MovieList"
import Input from "./Input/Input"
import Placeholder from "./Placeholders/PlaceholderSearching"
import AdvancedSearch from "./AdvancedSearch/AdvancedSearch"
import "./MovieSearch.scss"
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
      error: ""
    }

    this.searchContRef = React.createRef()
  }

  handleSearch = query => {
    console.log(query)
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
    if (!query || !query.trim())
      return this.setState({
        query: "",
        movies: [],
        isSearchingList: false,
        error: ""
      })

    this.setState({ query, error: "", isSearchingList: true })

    const { API_KEY } = this.props

    const getMovies = axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`
    )
    const getActors = axios.get(
      `https://api.tmdb.org/3/search/person?api_key=${API_KEY}&query=${query}`
    )

    axios
      .all([getMovies, getActors], {
        cancelToken: new CancelToken(function executor(c) {
          cancelRequest = c
        })
      })
      .then(
        axios.spread((...responses) => {
          const movies = responses[0].data
          const actors = responses[1].data
          const totalPages = movies.total_pages + actors.total_pages
          const moviesAndActors = [...movies.results, ...actors.results].sort(
            (a, b) => {
              if (a.popularity > b.popularity) {
                return -1
              }
              return 1
            }
          )

          this.setState({
            movies: moviesAndActors,
            isSearchingList: false,
            totalPages
          })
        })
      )
      .catch(err => {
        if (axios.isCancel(err)) return
        this.setState({
          movies: [],
          isSearchingList: false,
          error: "Something went wrong"
        })
      })

    // axios
    //   .get(
    //     `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`,
    //     {
    // cancelToken: new CancelToken(function executor(c) {
    //   cancelRequest = c
    // })
    //     }
    //   )
    //   .then(({ data: { results: movies, total_pages: totalPages } }) => {
    // this.setState({
    //   movies,
    //   isSearchingList: false,
    //   totalPages
    // })
    //   })
    // .catch(err => {
    //   if (axios.isCancel(err)) return
    //   this.setState({
    //     movies: [],
    //     isSearchingList: false,
    //     error: "Something went wrong"
    //   })
    // })
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
    return (
      <div className="movie-search">
        <div ref={this.searchContRef} className="movie-search__cont">
          <Input onSearch={this.handleSearch} onFocus={this.onFocus} />
          {/* <div className="movie-search__random">
            <button
              className="button button--random-search"
              type="button"
              onClick={() => this.props.randomMovies()}
            >
              Random movies
            </button>
          </div> */}

          <AdvancedSearch
            advancedSearch={this.props.advancedSearch}
            API_KEY={this.props.API_KEY}
            toggleActor={this.props.toggleActor}
            withActors={this.props.withActors}
            clearWithActors={this.props.clearWithActors}
          />
          <div className="search-list">
            {this.state.isSearchingList ? (
              <Placeholder />
            ) : !this.state.isSearchingList &&
              this.state.totalPages === 0 &&
              this.state.query !== "" &&
              this.state.listIsOpen ? (
              <PlaceholderNoResults
                message="No results found"
                handleClickOutside={this.handleClickOutside}
              />
            ) : (
              this.state.listIsOpen &&
              this.renderMovies(
                <MovieList
                  movies={this.state.movies}
                  selectedMovies={this.props.selectedMovies}
                  toggleMovie={this.props.toggleMovie}
                  handleClickOutside={this.handleClickOutside}
                />
              )
            )}
          </div>
        </div>
      </div>
    )
  }
}
