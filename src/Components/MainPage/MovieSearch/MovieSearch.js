import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import SearchList from "./SearchList/SearchList"
import Input from "./Input/Input"
import AdvancedSearch from "./AdvancedSearch/AdvancedSearch"
import "./MovieSearch.scss"
import PlaceholderNoResults from "../Placeholders/PlaceholderNoResults"

let cancelRequestMovies
let cancelRequestActors

export default class MovieSearch extends Component {
  constructor(props) {
    super(props)
    this.state = {
      query: "",
      searchResults: [],
      isSearchingList: false,
      totalPages: null,
      listIsOpen: false,
      error: ""
    }

    this.searchContRef = React.createRef()
  }

  handleSearch = query => {
    console.log(query)
    if (
      cancelRequestMovies !== undefined ||
      cancelRequestActors !== undefined
    ) {
      cancelRequestMovies()
      cancelRequestActors()
    }
    if (!query || !query.trim())
      return this.setState({
        query: "",
        searchResults: [],
        isSearchingList: false,
        error: ""
      })

    this.setState({ query, error: "", isSearchingList: true })

    const { API_KEY } = this.props

    const getMovies = axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`,
      {
        cancelToken: new CancelToken(function executor(c) {
          cancelRequestMovies = c
        })
      }
    )
    const getActors = axios.get(
      `https://api.tmdb.org/3/search/person?api_key=${API_KEY}&query=${query}`,
      {
        cancelToken: new CancelToken(function executor(c) {
          cancelRequestActors = c
        })
      }
    )

    axios
      .all([getMovies, getActors])
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
            searchResults: moviesAndActors,
            isSearchingList: false,
            totalPages
          })
        })
      )
      .catch(err => {
        if (axios.isCancel(err)) return
        this.setState({
          searchResults: [],
          isSearchingList: false,
          error: "Something went wrong"
        })
      })
  }

  renderSearch = list => {
    const { searchResults, error } = this.state
    return error || !Array.isArray(searchResults) ? (
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
          <Input
            onSearch={this.handleSearch}
            onFocus={this.onFocus}
            isSearchingList={this.state.isSearchingList}
          />
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
          <div
            className={`search-list ${this.state.isSearchingList ? "" : ""}`}
          >
            {this.state.totalPages === 0 &&
            this.state.query !== "" &&
            this.state.listIsOpen ? (
              <PlaceholderNoResults
                message="No results found"
                handleClickOutside={this.handleClickOutside}
              />
            ) : (
              this.state.listIsOpen &&
              this.renderSearch(
                <SearchList
                  searchResults={this.state.searchResults}
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
