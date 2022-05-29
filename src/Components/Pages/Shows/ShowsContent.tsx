import React, { useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { throttle } from 'throttle-debounce'
import classNames from 'classnames'
import PlaceholderNoShows from 'Components/UI/Placeholders/PlaceholderNoShows'
import Loader from 'Components/UI/Placeholders/Loader'
import { AppContext } from 'Components/AppContext/AppContextHOC'
import { useAppSelector } from 'app/hooks'
import { selectShows, selectShowsLoading } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useAppSelectorArray from 'Utils/Hooks/UseAppSelectorArray'
import { UserShowsInterface } from 'Components/UserContent/UseUserShowsRed/@Types'
import { isScrollNearBottom } from 'Utils'
import { INITIAL_STATE, ShowsContentState, ACTIONTYPES, ActionTypesEnum } from './ReducerConfig/@Types'
import reducer from './ReducerConfig'
import ShowsGrid from './ShowsGrid'
import ShowsSectionButtons from './ShowsSectionButtons'

const SCROLL_THRESHOLD = 800

const ShowsContent: React.FC = () => {
  const { authUser } = useFrequentVariables()
  const context = useContext(AppContext)

  const userShowsStore = useAppSelectorArray<UserShowsInterface>(selectShows)
  const showsInitialLoading = useAppSelector(selectShowsLoading)

  const [sortByState, setSortByState] = useState('name')

  const [{ disableLoad, activeSection, loadedShows }, localDispatch] = useReducer<
    React.Reducer<ShowsContentState, ACTIONTYPES>
  >(reducer, INITIAL_STATE)

  useEffect(() => {
    localDispatch({ type: ActionTypesEnum.UpdateContext, payload: { context } })
  }, [context])

  const loadNewContent = () => {
    if (disableLoad[activeSection] || !authUser?.uid) return
    localDispatch({ type: ActionTypesEnum.IncrementLoadedShows })
    localDispatch({ type: ActionTypesEnum.DisableLoad, payload: { userShows: userShowsStore } })
  }

  const loadNewContentLS = () => {
    if (disableLoad.watchingShowsLS || authUser?.uid) return
    localDispatch({ type: ActionTypesEnum.IncrementLoadedShowsLS })
    localDispatch({ type: ActionTypesEnum.DisableLoadLS })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleScroll = useCallback(
    throttle(500, () => {
      if (isScrollNearBottom({ scrollThreshold: SCROLL_THRESHOLD })) {
        loadNewContent()
        loadNewContentLS()
      }
    }),
    [disableLoad, activeSection],
  )
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const sortByHandler = (sortBy: string) => {
    if (sortBy === sortByState) return
    setSortByState(sortBy)
  }

  const toggleSection = (section: string) => {
    localDispatch({ type: ActionTypesEnum.ChangeActiveSection, payload: { activeSection: section } })
  }

  const showsData = useMemo(() => {
    if (authUser?.uid) {
      return Object.values(userShowsStore).filter((show) => {
        if (activeSection === 'finishedShows') {
          return show.finished
        }
        return show.database === activeSection && !show.finished
      })
    } else if (activeSection === 'watchingShows') {
      return context.userContentLocalStorage.watchingShows.slice(0, loadedShows.watchingShowsLS)
    }
    return []
  }, [userShowsStore, activeSection, loadedShows, context, authUser])

  const maxColumns = 4
  const currentNumOfColumns = showsData.length <= maxColumns - 1 ? showsData.length : maxColumns

  const loadingShows = authUser?.uid ? showsInitialLoading : false

  const renderContent = () => {
    if (loadingShows || context.userContentHandler.loadingShowsOnRegister) {
      return <Loader className="loader--pink" />
    }
    if (!showsData.length) {
      return <PlaceholderNoShows authUser={authUser} activeSection={activeSection} />
    }

    const getSortSlicedShows = () => {
      const data = showsData
      if (authUser?.uid) {
        return data
          .sort((a: any, b: any) => {
            if (a[sortByState] > b[sortByState]) {
              if (sortByState === 'timeStamp') return -1
              return 1
            }
            if (sortByState !== 'timeStamp') return -1
            return 1
          })
          .slice(0, loadedShows[activeSection])
      }
      return context.userContentLocalStorage.watchingShows.slice(0, loadedShows.watchingShowsLS)
    }

    return (
      <>
        {authUser.uid && (
          <div className="content-results__sortby">
            <div className="content-results__sortby-text">Sort by:</div>
            <div className="content-results__sortby-buttons">
              <div
                className={classNames('content-results__sortby-buttons', {
                  'content-results__sortby-button--active': sortByState === 'name',
                })}
              >
                <button type="button" className="button button--sortby-shows" onClick={() => sortByHandler('name')}>
                  Alphabetically
                </button>
              </div>
              <div
                className={classNames('content-results__sortby-button', {
                  'content-results__sortby-button--active': sortByState === 'timeStamp',
                })}
              >
                <button
                  type="button"
                  className="button button--sortby-shows"
                  onClick={() => sortByHandler('timeStamp')}
                >
                  Recently added
                </button>
              </div>
            </div>
          </div>
        )}
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
          <ShowsGrid data={getSortSlicedShows()} section={activeSection} />
        </div>
      </>
    )
  }

  return (
    <div className="content-results">
      <ShowsSectionButtons activeSection={activeSection} toggleSection={toggleSection} />
      {renderContent()}
    </div>
  )
}

export default ShowsContent
