import { ContactInfoInterface } from 'Components/Pages/Contacts/@Types'
import React, { useState, useCallback } from 'react'
import debounce from 'debounce'
import Loader from 'Components/UI/Placeholders/Loader'
import './SearchInput.scss'

type Props = {
  onSearch: (query: string) => void
  isSearching: boolean
  contactsList: ContactInfoInterface[]
}

const SearchInput: React.FC<Props> = ({ onSearch, isSearching, contactsList }) => {
  const [query, setQuery] = useState<string>('')

  const runSearch = (query: string) => {
    onSearch(query)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSearchDeb = useCallback(
    debounce((query: string) => {
      runSearch(query)
    }, 150),
    [contactsList],
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
    <div className="contacts-search__search">
      <input
        type="text"
        placeholder="Search for contact"
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
