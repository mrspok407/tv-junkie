import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import { Link } from "react-router-dom"
import * as ROUTES from "Utils/Constants/routes"
import classNames from "classnames"
import SearchList from "./SearchList/SearchList"
import Input from "./Input/Input"
import "./Search.scss"
import PlaceholderNoResults from "Components/Placeholders/PlaceholderNoResults"
import { withUserContent } from "Components/UserContent"

let cancelRequest

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      query: "",
      searchResults: [],
      contentInDatabase: [],
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

        const databases = ["watchLaterMovies", "userShows"]
        const contentInDatabase = []
        let counter = 0

        if (contentSortByPopularity.length !== 0) {
          databases.forEach(database => {
            contentSortByPopularity.forEach(content => {
              this.props.firebase[database](this.props.authUser.uid, "watchingShows")
                // .orderByChild("id")
                // .equalTo(content.id)
                .child(content.id)
                .once("value", snapshot => {
                  counter++

                  if (snapshot.val() !== null) {
                    let content = {}

                    Object.keys(snapshot.val()).forEach(key => {
                      content = { ...snapshot.val()[key], key }
                    })

                    contentInDatabase.push(content)
                  }

                  if (
                    counter === contentSortByPopularity.length * databases.length ||
                    contentSortByPopularity.length === 0
                  ) {
                    this.setState({
                      contentInDatabase: contentInDatabase,
                      searchResults: contentSortByPopularity,
                      isSearchingList: false,
                      totalPages,
                      mediaTypeSearching: mediatype.type.toLowerCase()
                    })
                  }
                })
            })
          })
        } else {
          this.setState({
            searchResults: contentSortByPopularity,
            isSearchingList: false,
            totalPages,
            mediaTypeSearching: mediatype.type.toLowerCase()
          })
        }
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

  updateContentInDbClient = (id, contentArr) => {
    console.log(this.state.contentInDatabase)
    const content = this.state.contentInDatabase.find(item => item.id === id)
    const contentToAdd = contentArr && contentArr.find(item => item.id === id)

    if (content) {
      this.setState(prevState => ({
        contentInDatabase: prevState.contentInDatabase.filter(item => item.id !== id)
      }))
    } else {
      this.setState(prevState => ({
        contentInDatabase: [...prevState.contentInDatabase, contentToAdd]
      }))
    }
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
          <div
            ref={this.searchContRef}
            className={classNames("search__input-cont", {
              "search__input-cont--nav-search": this.props.navSearch
            })}
          >
            <Input
              onSearch={this.handleSearch}
              onFocus={this.onFocus}
              isSearchingList={this.state.isSearchingList}
              navSearch={this.props.navSearch}
            />
            {this.state.totalPages === 0 && this.state.query !== "" && this.state.listIsOpen ? (
              <PlaceholderNoResults message="No results found" handleClickOutside={this.handleClickOutside} />
            ) : (
              this.state.listIsOpen &&
              this.renderSearch(
                <SearchList
                  searchResults={this.state.searchResults}
                  contentInDatabase={this.state.contentInDatabase}
                  updateContentInDbClient={this.updateContentInDbClient}
                  mediaTypeSearching={this.state.mediaTypeSearching}
                  handleClickOutside={this.handleClickOutside}
                  toggleCurrentlyChosenContent={this.props.toggleCurrentlyChosenContent}
                  currentlyChosenContent={this.props.currentlyChosenContent}
                  navSearch={this.props.navSearch}
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
        {this.props.renderCurrentlyChosenContent &&
          this.props.renderCurrentlyChosenContent(this.updateContentInDbClient)}
      </div>
    )
  }
}

export default withUserContent(Search)
