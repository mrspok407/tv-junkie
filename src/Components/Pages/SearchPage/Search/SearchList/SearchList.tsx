/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { useEffect } from "react"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"
import SearchCard from "./SearchCard"
import "./SearchList.scss"

type Props = {
  searchResults: ContentDetailes[]
  handleClickOutside: (e: CustomEvent) => void
  closeList: () => void
  currentListItem: number
  mediaTypeSearching: string
}

const SearchList: React.FC<Props> = ({
  searchResults,
  handleClickOutside,
  closeList,
  currentListItem,
  mediaTypeSearching
}) => {
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
    // eslint-disable-next-line
  }, [])

  return (
    <div className="search-list">
      {searchResults.map((item, index) => {
        return (
          <SearchCard
            key={item.id}
            detailes={item}
            closeList={closeList}
            currentListItem={currentListItem}
            index={index}
            mediaTypeSearching={mediaTypeSearching}
          />
        )
      })}
    </div>
  )
}

export default SearchList
