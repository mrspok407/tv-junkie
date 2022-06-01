/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import PlaceholderNoResults from 'Components/UI/Placeholders/PlaceholderNoResults'
import React, { useEffect } from 'react'
import { DataTMDBAPIInterface } from 'Utils/Interfaces/DataTMDBAPIInterface'
import SearchCard from './SearchCard'
import './SearchList.scss'

type Props = {
  searchResults: DataTMDBAPIInterface[]
  handleClickOutside: (e: CustomEvent) => void
  closeList: () => void
  currentListItem: number
  mediaTypeSearching: string
  listIsOpen: boolean
  query: string
  isSearchingList: boolean
  error: string
}

const SearchList: React.FC<Props> = ({
  searchResults,
  handleClickOutside,
  closeList,
  currentListItem,
  mediaTypeSearching,
  listIsOpen,
  query,
  isSearchingList,
  error,
}) => {
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside as EventListener)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener)
    }
    // eslint-disable-next-line
  }, [])

  return (
    <div className="search-list">
      {error ? (
        <div className="error">
          <p>{error || 'Something gone terrible wrong'}</p>
        </div>
      ) : searchResults.length === 0 && query !== '' && listIsOpen && !isSearchingList ? (
        <PlaceholderNoResults message="No results found" />
      ) : (
        searchResults.map((item, index) => (
          <SearchCard
            key={item.id}
            detailes={item}
            closeList={closeList}
            currentListItem={currentListItem}
            index={index}
            mediaTypeSearching={mediaTypeSearching}
          />
        ))
      )}
    </div>
  )
}

export default SearchList
