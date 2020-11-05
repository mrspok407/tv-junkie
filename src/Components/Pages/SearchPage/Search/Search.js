import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import { Link, withRouter } from "react-router-dom"
import { compose } from "recompose"
import * as _isFunction from "lodash.isfunction"
import * as ROUTES from "Utils/Constants/routes"
import SearchList from "./SearchList/SearchList"
import Input from "./Input/Input"
import PlaceholderNoResults from "Components/UI/Placeholders/PlaceholderNoResults"
import userContentHandler from "Components/UserContent/UseContentHandler"
import "./Search.scss"

let cancelRequest

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      query: "",
      searchResults: [],
      isSearchingList: false,
      totalPages: null,
      listIsOpen: false,
      currentListItem: 0,
      mediaTypeSearching: "",
      error: ""
    }

    this.searchContRef = React.createRef()
  }

  componentWillUnmount() {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
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
        const contentSortByPopularity = content
          .sort((a, b) => (a.popularity > b.popularity ? -1 : 1))
          .slice(0, 5)

        this.setState({
          searchResults: contentSortByPopularity,
          isSearchingList: false,
          totalPages,
          mediaTypeSearching: mediatype.type.toLowerCase()
        })
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        this.setState({
          searchResults: [],
          isSearchingList: false,
          error: "Something went wrong"
        })
      })
  }

  renderSearch = (list) => {
    const { searchResults, error } = this.state
    return error || !Array.isArray(searchResults) ? (
      <div className="error">
        <p>{error || "Something gone terrible wrong"}</p>
      </div>
    ) : (
      list
    )
  }

  handleClickOutside = (e) => {
    if (
      (this.searchContRef.current && !this.searchContRef.current.contains(e.target)) ||
      (this.props.navRef && !this.props.navRef.current.contains(e.target))
    ) {
      this.setState({
        listIsOpen: false
      })
      this.onBlur()
    }
  }

  onFocus = () => {
    if (this.props.navSearch) {
      const navItem = document.querySelectorAll(".nav__link")
      const input = document.querySelector(".search__input")

      input.classList.add("search__input--focus")
      navItem.forEach((item) => {
        item.classList.remove("nav__link-move-back")
        item.classList.add("nav__link-move")
      })
    }

    this.setState({
      listIsOpen: true
    })
  }

  onBlur = () => {
    const navItem = document.querySelectorAll(".nav__link")
    const input = document.querySelector(".search__input")

    input.classList.remove("search__input--focus")
    navItem.forEach((item) => {
      item.classList.remove("nav__link-move")
      item.classList.add("nav__link-move-back")
    })
  }

  closeList = () => {
    this.setState({
      listIsOpen: false,
      currentListItem: 0
    })
    this.onBlur()
    if (_isFunction(this.props.closeNavMobile)) this.props.closeNavMobile()
  }

  linkOnKeyPress = () => {
    if (!this.state.listIsOpen || this.state.isSearchingList) return

    const content = this.state.searchResults[this.state.currentListItem]
    const mediaType = content.original_title ? "movie" : content.original_name ? "show" : null

    if (!mediaType) return
    if (this.state.searchResults.length === 0) return

    this.closeList()

    this.props.history.push(`/${mediaType}/${content.id}`)
  }

  navigateSearchListByArrows = (arrowKey) => {
    if (!this.state.listIsOpen || this.state.isSearchingList) return
    if (this.state.searchResults.length === 0) return

    if (arrowKey === 40 && this.state.searchResults.length !== this.state.currentListItem + 1) {
      this.setState({ currentListItem: this.state.currentListItem + 1 })
    }
    if (arrowKey === 38 && this.state.currentListItem > 0) {
      this.setState({ currentListItem: this.state.currentListItem - 1 })
    }
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
              listIsOpen={this.state.listIsOpen}
              navSearch={this.props.navSearch}
              linkOnKeyPress={this.linkOnKeyPress}
              navigateSearchListByArrows={this.navigateSearchListByArrows}
            />
            {this.state.totalPages === 0 && this.state.query !== "" && this.state.listIsOpen ? (
              <PlaceholderNoResults message="No results found" handleClickOutside={this.handleClickOutside} />
            ) : (
              this.state.listIsOpen &&
              this.renderSearch(
                <SearchList
                  searchResults={this.state.searchResults}
                  closeList={this.closeList}
                  isSearchingList={this.state.isSearchingList}
                  navSearch={this.props.navSearch}
                  currentListItem={this.state.currentListItem}
                  mediaTypeSearching={this.state.mediaTypeSearching}
                  handleClickOutside={this.handleClickOutside}
                />
              )
            )}
            {this.props.navSearch && (
              <div className="search__link-to-adv-container">
                <Link className="search__link-to-adv" to={ROUTES.SEARCH_PAGE}></Link>
                <span className="tooltip">Advanced search</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Search)
