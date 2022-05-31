import React, { useCallback, useReducer, useState } from 'react'
import classNames from 'classnames'
import PlaceholderNoShows from 'Components/UI/Placeholders/PlaceholderNoShows'
import Loader from 'Components/UI/Placeholders/Loader'
import { useAppSelector } from 'app/hooks'
import { selectShows, selectShowsLoading } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useAppSelectorArray from 'Utils/Hooks/UseAppSelectorArray'
import { UserShowsInterface } from 'Components/UserContent/UseUserShowsRed/@Types'
import useScrollEffect from 'Utils/Hooks/UseScrollEffect'
import { INITIAL_STATE, ShowsContentState, ACTIONTYPES, ActionTypesEnum } from './ReducerConfig/@Types'
import reducer from './ReducerConfig'
import ShowsGrid from './Components/ShowsGrid'
import ShowsSectionButtons from './Components/ShowsSectionButtons'
import UseSectionFilteredShows from './Hooks/UseSectionFilteredShows'
import UseSortSlicedShows from './Hooks/UseSortSlicedShows'
import SortByOptions from './Components/SortByOptions'

const SCROLL_THRESHOLD = 800
const THROTTLE_TIMEOUT = 500
const MAX_GRID_COLUMNS = 4

const ShowsContent: React.FC = () => {
  const { authUser, userContentHandler } = useFrequentVariables()

  const [{ activeSection, loadedShows }, localDispatch] = useReducer<React.Reducer<ShowsContentState, ACTIONTYPES>>(
    reducer,
    INITIAL_STATE,
  )
  const [sortBy, setSortBy] = useState('name')

  const userShowsStore = useAppSelectorArray<UserShowsInterface>(selectShows)
  const sectionFilteredShows = UseSectionFilteredShows({ showsData: userShowsStore, activeSection })
  const sortSlicedShows = UseSortSlicedShows({
    showsData: sectionFilteredShows,
    activeSection,
    sortByState: sortBy,
    loadedShows,
  })
  const showsInitialLoading = useAppSelector(selectShowsLoading)

  const loadNewContent = useCallback(() => {
    if (!authUser?.uid) {
      localDispatch({ type: ActionTypesEnum.IncrementLoadedShowsLS, payload: { sectionFilteredShows } })
      return
    }
    localDispatch({ type: ActionTypesEnum.IncrementLoadedShows, payload: { sectionFilteredShows } })
  }, [sectionFilteredShows, authUser])

  useScrollEffect({ callback: loadNewContent, scrollThreshold: SCROLL_THRESHOLD, timeOut: THROTTLE_TIMEOUT })

  const handleSortBy = (sortBy: string) => {
    setSortBy(sortBy)
  }

  const handleToggleSection = (section: string) => {
    localDispatch({ type: ActionTypesEnum.ChangeActiveSection, payload: { activeSection: section } })
  }

  const renderContent = () => {
    const loadingShows = authUser?.uid ? showsInitialLoading : false
    if (loadingShows || userContentHandler.loadingShowsOnRegister) {
      return <Loader className="loader--pink" />
    }

    if (!sortSlicedShows.length) {
      return <PlaceholderNoShows authUser={authUser} activeSection={activeSection} />
    }

    const currentNumOfColumns =
      sortSlicedShows.length <= MAX_GRID_COLUMNS - 1 ? sortSlicedShows.length : MAX_GRID_COLUMNS

    return (
      <>
        {authUser.uid && <SortByOptions sortBy={sortBy} handleSortBy={handleSortBy} />}
        <div
          className={classNames('content-results__wrapper', {
            'content-results__wrapper--finished-shows': activeSection === 'finishedShows',
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
          <ShowsGrid data={sortSlicedShows} section={activeSection} />
        </div>
      </>
    )
  }

  return (
    <div className="content-results">
      <ShowsSectionButtons activeSection={activeSection} handleToggleSection={handleToggleSection} />
      {renderContent()}
    </div>
  )
}

export default ShowsContent
