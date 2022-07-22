import React, { useCallback, useReducer, useState } from 'react'
import classNames from 'classnames'
import PlaceholderNoMovies from 'Components/UI/Placeholders/PlaceholderNoMovies'
import Loader from 'Components/UI/Placeholders/Loader'
import { useAppSelector } from 'app/hooks'
import { selectMovies, selectMoviesLoading } from 'Components/UserContent/UseUserMoviesRed/userMoviesSliceRed'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useAppSelectorArray from 'Utils/Hooks/UseAppSelectorArray'
import { MovieFullDataStoreState } from 'Components/UserContent/UseUserMoviesRed/@Types'
import useScrollEffect from 'Utils/Hooks/UseScrollEffect'
import { INITIAL_STATE, MoviesContentState, ACTIONTYPES, ActionTypesEnum } from './ReducerConfig/@Types'
import reducer from './ReducerConfig'
import MoviesGrid from './Components/MoviesGrid'
import MoviesSectionButtons from './Components/MoviesSectionButtons'
import UseSectionFilteredMovies from './Hooks/UseSectionFilteredMovies'
import UseSortSlicedMovies from './Hooks/UseSortSlicedMovies'
import SortByOptions from './Components/SortByOptions'

const SCROLL_THRESHOLD = 800
const THROTTLE_TIMEOUT = 500
const MAX_GRID_COLUMNS = 4

const MoviesContent: React.FC = () => {
  const { authUser } = useFrequentVariables()

  console.log('MoviesContent Rerender')

  const [{ activeSection, loadedMovies }, localDispatch] = useReducer<React.Reducer<MoviesContentState, ACTIONTYPES>>(
    reducer,
    INITIAL_STATE,
  )
  const [sortBy, setSortBy] = useState('name')

  const userMoviesStore = useAppSelectorArray<MovieFullDataStoreState>(selectMovies)
  const sectionFilteredMovies = UseSectionFilteredMovies({ moviesData: userMoviesStore, activeSection })
  const sortSlicedMovies = UseSortSlicedMovies({
    moviesData: sectionFilteredMovies,
    activeSection,
    sortByState: sortBy,
    loadedMovies,
  })
  const moviesInitialLoading = useAppSelector(selectMoviesLoading)

  const loadNewContent = useCallback(() => {
    if (!authUser?.uid) {
      localDispatch({ type: ActionTypesEnum.IncrementLoadedMoviesLS, payload: { sectionFilteredMovies } })
      return
    }
    localDispatch({ type: ActionTypesEnum.IncrementLoadedMovies, payload: { sectionFilteredMovies } })
  }, [sectionFilteredMovies, authUser])

  useScrollEffect({ callback: loadNewContent, scrollThreshold: SCROLL_THRESHOLD, timeOut: THROTTLE_TIMEOUT })

  const handleSortBy = (sortBy: string) => {
    setSortBy(sortBy)
  }

  const handleToggleSection = (section: string) => {
    localDispatch({ type: ActionTypesEnum.ChangeActiveSection, payload: { activeSection: section } })
  }

  const renderContent = () => {
    const loadingMovies = authUser?.uid ? moviesInitialLoading : false
    // if (loadingMovies || context.userContentHandler.loadingMoviesOnRegister) {
    if (loadingMovies) {
      return <Loader className="loader--pink" />
    }

    if (!sortSlicedMovies.length) {
      return <PlaceholderNoMovies />
    }

    const currentNumOfColumns =
      sortSlicedMovies.length <= MAX_GRID_COLUMNS - 1 ? sortSlicedMovies.length : MAX_GRID_COLUMNS

    return (
      <>
        {authUser.uid && <SortByOptions sortBy={sortBy} handleSortBy={handleSortBy} />}

        <div
          className={classNames('content-results__wrapper', {
            'content-results__wrapper--finished-shows': activeSection === 'finishedMovies',
          })}
          style={
            currentNumOfColumns <= 3
              ? {
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 350px))',
                }
              : {
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                }
          }
        >
          <MoviesGrid data={sortSlicedMovies} section={activeSection} />
        </div>
      </>
    )
  }

  return (
    <div className="content-results">
      <MoviesSectionButtons activeSection={activeSection} handleToggleSection={handleToggleSection} />
      {renderContent()}
    </div>
  )
}

export default MoviesContent
