/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react"
import { useHistory } from "react-router-dom"
import debounce from "debounce"
import classNames from "classnames"
import Loader from "Components/UI/Placeholders/Loader"
import { mediaTypesArr } from "Utils"
import { HandleSearchArg } from "../Search"
import "./Input.scss"

const MOBILE_LAYOUT = 1000

type Props = {
  onSearch: ({ query, mediatype }: HandleSearchArg) => void
  onFocus: () => void
  linkOnKeyPress: () => void
  navigateSearchListByArrows: (key: number) => void
  isSearchingList: boolean
  listIsOpen: boolean
  navSearch?: boolean
}

interface MediaType {
  type: string
  icon: string
}

const Input: React.FC<Props> = ({
  onSearch,
  onFocus,
  isSearchingList,
  listIsOpen,
  navSearch,
  linkOnKeyPress,
  navigateSearchListByArrows
}) => {
  const [query, setQuery] = useState<string>("")
  const [mediaType, setMediaType] = useState<MediaType>({ type: "Multi", icon: mediaTypesArr[0].icon })
  const [mediaTypesIsOpen, setMediaTypesIsOpen] = useState(false)
  const [searchReset, setSearchReset] = useState(false)

  const mediaTypeRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const history = useHistory()

  useEffect(() => {
    const windowWidth = window.innerWidth
    if (history.action === "PUSH" && !navSearch && windowWidth > MOBILE_LAYOUT && inputRef?.current) {
      inputRef.current.focus()
    }

    document.addEventListener("mousedown", handleClickOutside as EventListener)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, [])

  useEffect(() => {
    _runSearch(query, mediaType)
  }, [mediaType])

  useEffect(() => {
    _runSearch(query, mediaType)
  }, [searchReset])

  const handleClickOutside = (e: CustomEvent) => {
    if (mediaTypeRef && mediaTypeRef.current && !mediaTypeRef.current.contains(e.target as Node)) {
      setMediaTypesIsOpen(false)
    }
  }

  const _runSearch = (query: string, mediatype: MediaType) => {
    onSearch({ query, mediatype })
  }

  const runSearchDeb = useCallback(
    debounce((query: string, mediatype: MediaType) => {
      onSearch({ query, mediatype })
    }, 300),
    []
  )

  const handleChange = (e: any) => {
    setQuery(e.target.value)
    runSearchDeb(e.target.value, mediaType)
  }

  const linkOnKeyPressDeb = debounce(() => {
    if (inputRef && inputRef.current) inputRef.current.blur()
    linkOnKeyPress()
  }, 300)

  const resetSearch = () => {
    setQuery("")
    setSearchReset(!searchReset)
  }

  const handleKeyDown = (e: any) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault()
    }

    if (e.which === 27) resetSearch()
    if (e.which === 13) linkOnKeyPressDeb()
    if (e.which === 38 || e.which === 40) navigateSearchListByArrows(e.which)
  }

  return (
    <>
      <div
        ref={mediaTypeRef}
        className={classNames("search__media-type", {
          "search__media-type--is-open": mediaTypesIsOpen
        })}
        style={{
          backgroundImage: `url(${mediaType.icon})`
        }}
      >
        <button
          type="button"
          onClick={() => setMediaTypesIsOpen(!mediaTypesIsOpen)}
          className="media-type__button media-type__selected-value"
        >
          <span>{mediaType.type === "Multi" ? "All" : mediaType.type}</span>
        </button>
        {mediaTypesIsOpen && (
          <div className="media-type__options">
            <ul className="media-type__list">
              {mediaTypesArr.map((item) => {
                const type = item.type === "Multi" ? "All" : item.type
                return (
                  <li
                    key={item.id}
                    className={classNames("media-type__item", {
                      "media-type__item--selected": item.type === mediaType.type
                    })}
                    style={{ backgroundImage: `url(${item.icon})` }}
                  >
                    <button
                      type="button"
                      className="media-type__button"
                      value={item.type}
                      onClick={(e: any) => {
                        if (listIsOpen && inputRef.current) {
                          inputRef.current.focus()
                        }
                        setMediaType({ type: e.target.value, icon: item.icon })
                        setMediaTypesIsOpen(false)
                      }}
                    >
                      {type}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        className="search__input"
        type="text"
        placeholder="Search"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
      />
      {isSearchingList && <Loader className="loader--small-pink" />}
      {query && <button type="button" className="button--input-clear" onClick={resetSearch} />}
    </>
  )
}

export default Input
