import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Link, useHistory } from "react-router-dom"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"
import * as _isFunction from "lodash.isfunction"
import * as ROUTES from "Utils/Constants/routes"
import SearchList from "./SearchList/SearchList"
import Input from "./Input/Input"
import PlaceholderNoResults from "Components/UI/Placeholders/PlaceholderNoResults"
import "./Search.scss"

const { CancelToken } = require("axios")

let cancelRequest: any

type Props = {
  navSearch?: boolean
  navRef?: React.RefObject<any>
  closeNavMobile: () => void
}

export interface HandleSearchArg {
  query: string
  mediatype: { type: string; icon: string }
}

const Search: React.FC<Props> = ({ navSearch, navRef, closeNavMobile }) => {
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ContentDetailes[]>([])
  const [isSearchingList, setIsSearchingList] = useState(false)
  const [listIsOpen, setListIsOpen] = useState(false)
  const [totalPages, setTotalPages] = useState(null)
  const [currentListItem, setCurrentListItem] = useState(0)
  const [mediaTypeSearching, setMediaTypeSearching] = useState("")
  const [error, setError] = useState("")

  const searchContRef = useRef<HTMLDivElement>(null)

  const history = useHistory()

  useEffect(() => {
    return () => {
      if (cancelRequest !== undefined) {
        cancelRequest()
      }
    }
  }, [])

  const handleSearch = ({ query, mediatype }: HandleSearchArg) => {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
    if (!query || !query.trim()) {
      setQuery("")
      setSearchResults([])
      setIsSearchingList(false)
      setError("")
      return
    }

    setQuery(query)
    setIsSearchingList(true)

    axios
      .get(
        `https://api.tmdb.org/3/search/${mediatype.type.toLowerCase()}?api_key=${
          process.env.REACT_APP_TMDB_API
        }&query=${query}`,
        {
          cancelToken: new CancelToken(function executor(c: any) {
            cancelRequest = c
          })
        }
      )
      .then(({ data: { results, total_pages: totalPages } }) => {
        const content = [...results]
        const contentSortByPopularity = content
          .sort((a, b) => (a.popularity > b.popularity ? -1 : 1))
          .slice(0, 5)

        setSearchResults(contentSortByPopularity)
        setIsSearchingList(false)
        setTotalPages(totalPages)
        setMediaTypeSearching(mediatype.type.toLowerCase())
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        setSearchResults([])
        setIsSearchingList(false)
        setError("Something went wrong")
      })
  }

  const renderSearch = (list: any) => {
    return error || !Array.isArray(searchResults) ? (
      <div className="error">
        <p>{error || "Something gone terrible wrong"}</p>
      </div>
    ) : (
      list
    )
  }

  const handleClickOutside = (e: CustomEvent) => {
    if (
      (searchContRef && searchContRef.current && !searchContRef.current.contains(e.target as Node)) ||
      (navRef && navRef.current && !navRef.current.contains(e.target))
    ) {
      setListIsOpen(false)
      onBlur()
    }
  }

  const onFocus = () => {
    if (navSearch) {
      const navItem = document.querySelectorAll(".nav__link")
      const input = document.querySelector(".search__input")!

      input.classList.add("search__input--focus")
      navItem.forEach((item) => {
        item.classList.remove("nav__link-move-back")
        item.classList.add("nav__link-move")
      })
    }

    setListIsOpen(true)
  }

  const onBlur = () => {
    const navItem = document.querySelectorAll(".nav__link")
    const input = document.querySelector(".search__input")!

    input.classList.remove("search__input--focus")
    navItem.forEach((item) => {
      item.classList.remove("nav__link-move")
      item.classList.add("nav__link-move-back")
    })
  }

  const closeList = () => {
    setListIsOpen(false)
    setCurrentListItem(0)
    onBlur()
    if (_isFunction(closeNavMobile)) closeNavMobile()
  }

  const linkOnKeyPress = () => {
    if (!listIsOpen || isSearchingList) return

    const content = searchResults[currentListItem]
    const mediaType = content.original_title ? "movie" : content.original_name ? "show" : null

    if (!mediaType) return
    if (searchResults.length === 0) return

    closeList()

    history.push(`/${mediaType}/${content.id}`)
  }

  const navigateSearchListByArrows = (arrowKey: number) => {
    if (!listIsOpen || isSearchingList) return
    if (searchResults.length === 0) return

    if (arrowKey === 40 && searchResults.length !== currentListItem + 1) {
      setCurrentListItem(currentListItem + 1)
    }
    if (arrowKey === 38 && currentListItem > 0) {
      setCurrentListItem(currentListItem - 1)
    }
  }

  return (
    <div className="search">
      <div className="search__cont">
        <div ref={searchContRef} className="search__input-cont">
          <Input
            onSearch={handleSearch}
            onFocus={onFocus}
            isSearchingList={isSearchingList}
            listIsOpen={listIsOpen}
            navSearch={navSearch}
            linkOnKeyPress={linkOnKeyPress}
            navigateSearchListByArrows={navigateSearchListByArrows}
          />
          {totalPages === 0 && query !== "" && listIsOpen ? (
            <PlaceholderNoResults message="No results found" handleClickOutside={handleClickOutside} />
          ) : (
            listIsOpen &&
            renderSearch(
              <SearchList
                searchResults={searchResults}
                closeList={closeList}
                currentListItem={currentListItem}
                mediaTypeSearching={mediaTypeSearching}
                handleClickOutside={handleClickOutside}
              />
            )
          )}
          {navSearch && (
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

export default Search
