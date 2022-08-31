import React, { useMemo, useRef } from 'react'
import Loader from 'Components/UI/Placeholders/Loader'
import PlaceholderNoToWatchEpisodes from 'Components/UI/Placeholders/PlaceholderNoToWatchEpisodes'
import { useAppSelector } from 'app/hooks'
import {
  selectShow,
  selectShowsIdsReverse,
  selectShowsLoading,
} from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import ToWatchShow from './Components/ToWatchShow'

const ToWatchEpisodesContent: React.FC = () => {
  const showsInitialLoading = useAppSelector(selectShowsLoading)

  const selectUserShowIdsReverse = useMemo(selectShowsIdsReverse, [])
  const userShowsIds = useAppSelector(selectUserShowIdsReverse)

  const showsListRef = useRef<HTMLDivElement>(null!)
  const isCheckEpisodeAnimationRunning = useRef(false)

  const noToWatchEpisodes = useAppSelector((state) => {
    const idsNotAllWatched = userShowsIds.filter((id) => {
      const showStore = selectShow(state, id)
      return showStore?.allReleasedEpisodesWatched === false && showStore.database === 'watchingShows'
    })
    return !!idsNotAllWatched.length
  })

  if (showsInitialLoading) {
    return (
      <div className="content-results content-results--calendar">
        <Loader className="loader--pink" />
      </div>
    )
  }

  if (!noToWatchEpisodes) {
    return (
      <div className="content-results content-results--calendar">
        <PlaceholderNoToWatchEpisodes />
      </div>
    )
  }

  return (
    <div ref={showsListRef} className="content-results content-results--to-watch-page">
      {userShowsIds.map((showId, index) => {
        return (
          <ToWatchShow
            key={showId}
            showId={showId}
            showsListRef={showsListRef}
            isCheckEpisodeAnimationRunning={isCheckEpisodeAnimationRunning}
            showIndex={index}
          />
        )
      })}
    </div>
  )
}

export default ToWatchEpisodesContent
