import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Link, useHistory } from 'react-router-dom'
import { ContentDetailes } from 'Utils/Interfaces/ContentDetails'
import * as _isFunction from 'lodash.isfunction'
import * as ROUTES from 'Utils/Constants/routes'
import SearchList from './SearchList/SearchList'
import Input from './Input/Input'
import './Search.scss'

const { CancelToken } = require('axios')

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
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ContentDetailes[]>([])
  const [isSearchingList, setIsSearchingList] = useState(false)
  const [listIsOpen, setListIsOpen] = useState(false)
  const [currentListItem, setCurrentListItem] = useState(0)
  const [mediaTypeSearching, setMediaTypeSearching] = useState('')
  const [error, setError] = useState('')

  const searchContRef = useRef<HTMLDivElement>(null)
  const history = useHistory()

  useEffect(() => () => {
      if (cancelRequest !== undefined) {
        cancelRequest()
      }
    }, [])

  const handleSearch = ({ query, mediatype }: HandleSearchArg) => {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
    if (!query || !query.trim()) {
      setQuery('')
      setSearchResults([])
      setIsSearchingList(false)
      setError('')
      return
    }

    setQuery(query)
    setIsSearchingList(true)

    axios
      .get(
        `https://api.tmdb.org/3/search/${mediatype.type?.toLowerCase()}?api_key=${
          process.env.REACT_APP_TMDB_API
        }&query=${query}`,
        {
          cancelToken: new CancelToken((c: any) => {
            cancelRequest = c
          }),
        },
      )
      .then(({ data: { results } }) => {
        const content = [...results]
        const contentSortByPopularity = content.sort((a, b) => (a.popularity > b.popularity ? -1 : 1)).slice(0, 5)

        setSearchResults(contentSortByPopularity)
        setIsSearchingList(false)
        setMediaTypeSearching(mediatype.type?.toLowerCase())
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        setSearchResults([])
        setIsSearchingList(false)
        setError('Something went wrong')
      })
  }

  const handleClickOutside = (e: CustomEvent) => {
    if (!searchContRef?.current?.contains(e.target as Node)) {
      setListIsOpen(false)
      onBlur()
    }
  }

  const onFocus = () => {
    if (navSearch) {
      const navItem = document.querySelectorAll('.nav__link')
      const input = document.querySelector('.search__input')!

      input.classList.add('search__input--focus')
      navItem.forEach((item) => {
        item.classList.remove('nav__link-move-back')
        item.classList.add('nav__link-move')
      })
    }

    setListIsOpen(true)
  }

  const onBlur = () => {
    const navItem = document.querySelectorAll('.nav__link')
    const input = document.querySelector('.search__input')!

    input.classList.remove('search__input--focus')
    navItem.forEach((item) => {
      item.classList.remove('nav__link-move')
      item.classList.add('nav__link-move-back')
    })
  }

  const closeList = () => {
    setListIsOpen(false)
    setCurrentListItem(0)
    onBlur()
    if (_isFunction(closeNavMobile)) closeNavMobile()
  }

  const linkOnKeyPress = () => {
    if (!listIsOpen || isSearchingList || searchResults.length === 0) return

    const content = searchResults[currentListItem]
    const mediaType = content.original_title ? 'movie' : content.original_name ? 'show' : null

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

          {listIsOpen && (
            <SearchList
              searchResults={searchResults}
              closeList={closeList}
              currentListItem={currentListItem}
              mediaTypeSearching={mediaTypeSearching}
              listIsOpen={listIsOpen}
              query={query}
              handleClickOutside={handleClickOutside}
              isSearchingList={isSearchingList}
              error={error}
            />
          )}

          {navSearch && (
            <div className="search__link-to-adv-container">
              <Link className="search__link-to-adv" to={ROUTES.SEARCH_PAGE} />
              <span className="tooltip">Advanced search</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search
