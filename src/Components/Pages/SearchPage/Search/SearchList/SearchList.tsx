/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import PlaceholderNoResults from 'Components/UI/Placeholders/PlaceholderNoResults'
import React from 'react'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import useClickOutside from 'Utils/Hooks/UseClickOutside'
import SearchCard from './SearchCard'
import './SearchList.scss'

type Props = {
  searchResults: MainDataTMDB[]
  handleClickOutside: () => void
  closeList: () => void
  currentListItem: number
  mediaTypeSearching: string
  listIsOpen: boolean
  query: string
  isSearchingList: boolean
  error: string
  searchContRef: React.MutableRefObject<HTMLDivElement>
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
  searchContRef,
  error,
}) => {
  useClickOutside({ ref: searchContRef, callback: handleClickOutside })
  const renderData = () => {
    if (error) {
      return (
        <div className="error">
          <p>{error || 'Something gone terrible wrong'}</p>
        </div>
      )
    }
    if (searchResults.length === 0 && query !== '' && listIsOpen && !isSearchingList) {
      return <PlaceholderNoResults message="No results found" />
    }
    return searchResults.map((item, index) => (
      <SearchCard
        key={item.id}
        details={item}
        closeList={closeList}
        currentListItem={currentListItem}
        index={index}
        mediaTypeSearching={mediaTypeSearching}
      />
    ))
  }

  return <div className="search-list">{renderData()}</div>
}

export default SearchList
