import React, { useState, useCallback } from 'react'
import debounce from 'debounce'
import Loader from 'Components/UI/Placeholders/Loader'
import './SearchInput.scss'

type Props = {
  onSearch: (query: string) => void
  isSearching: boolean
}

const SearchInput: React.FC<Props> = ({ onSearch, isSearching }) => {
  const [query, setQuery] = useState<string>('')

  const _runSearch = (query: string) => {
    onSearch(query)
  }

  const onSearchDeb = useCallback(
    debounce((query: string) => {
      _runSearch(query)
    }, 150),
    [],
  )

  const handleChange = (e: any) => {
    setQuery(e.target.value)
    onSearchDeb(e.target.value)
  }

  const resetSearch = () => {
    setQuery('')
    onSearch('')
  }

  const handleKeyDown = (e: any) => {
    if (e.which === 27) resetSearch()
  }

  return (
    <div className="members-menu__search">
      <input
        type="text"
        placeholder="Search member"
        className="search__input"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />

      {isSearching && <Loader className="loader--small-pink" />}
      {query && <button type="button" className="button--input-clear" onClick={resetSearch} />}
    </div>
  )
}

export default SearchInput
