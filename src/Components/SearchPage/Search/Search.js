import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import SearchList from "./SearchList/SearchList"
import Input from "./Input/Input"
import AdvancedSearch from "./AdvancedSearch/AdvancedSearch"
import "./Search.scss"
import PlaceholderNoResults from "Components/Placeholders/PlaceholderNoResults"

let cancelRequest

export default class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      query: "",
      searchResults: [],
      isSearchingList: false,
      totalPages: null,
      listIsOpen: false,
      mediaTypeSearching: "",
      error: ""
    }

    this.searchContRef = React.createRef()
  }

  handleSearch = (query, mediatype) => {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
    if (!query || !query.trim())
      return this.setState({
        query: "",
        searchResults: [],
        isSearchingList: false,
        error: ""
      })

    this.setState({ query, error: "", isSearchingList: true })

    axios
      .get(
        `https://api.tmdb.org/3/search/${mediatype.type.toLowerCase()}?api_key=${
          process.env.REACT_APP_TMDB_API
        }&query=${query}`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
      .then(({ data: { results, total_pages: totalPages } }) => {
        const content = [...results]
        const contentSortByPopularity = content.sort((a, b) => {
          if (a.popularity > b.popularity) {
            return -1
          }
          return 1
        })

        this.setState({
          searchResults: contentSortByPopularity,
          isSearchingList: false,
          totalPages,
          mediaTypeSearching: mediatype.type.toLowerCase()
        })
      })

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
    if (this.searchContRef.current && !this.searchContRef.current.contains(e.target)) {
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
      <div className="search">
        <div className="search__cont">
          <div ref={this.searchContRef} className="search__input-cont">
            <Input
              onSearch={this.handleSearch}
              onFocus={this.onFocus}
              isSearchingList={this.state.isSearchingList}
            />
            {this.state.totalPages === 0 && this.state.query !== "" && this.state.listIsOpen ? (
              <PlaceholderNoResults message="No results found" handleClickOutside={this.handleClickOutside} />
            ) : (
              this.state.listIsOpen &&
              this.renderSearch(
                <div className="search-list">
                  <SearchList
                    searchResults={this.state.searchResults}
                    mediaTypeSearching={this.state.mediaTypeSearching}
                    handleClickOutside={this.handleClickOutside}
                    toggleCurrentlyChoosenContent={this.props.toggleCurrentlyChoosenContent}
                    currentlyChoosenContent={this.props.currentlyChoosenContent}
                  />
                </div>
              )
            )}
          </div>
          <AdvancedSearch
            advancedSearch={this.props.advancedSearch}
            searchingAdvancedSearch={this.props.searchingAdvancedSearch}
            toggleActor={this.props.toggleActor}
            withActors={this.props.withActors}
            clearWithActors={this.props.clearWithActors}
          />
        </div>
      </div>
    )
  }
}
