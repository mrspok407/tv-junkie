import React, { useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { selectShow } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { Link } from 'react-router-dom'
import { getSeasons, shouldToWatchShowRender } from '../Helpers'
import ToWatchSeason from './ToWatchSeason/ToWatchSeason'

type Props = {
  showId: number
  showsListRef: React.MutableRefObject<HTMLDivElement>
  isCheckEpisodeAnimationRunning: React.MutableRefObject<boolean>
  showIndex: number
}

const ToWatchShow: React.FC<Props> = ({ showId, showsListRef, isCheckEpisodeAnimationRunning, showIndex }) => {
  const dispatch = useAppDispatch()
  const userShow = useAppSelector((state) => selectShow(state, showId))!

  const seasonsListRef = useRef<HTMLDivElement>(null!)

  const seasonsRef = dispatch(getSeasons({ showId }))

  const initialOpenSeasonNumber = useMemo(() => {
    const seasonsNotWatched = seasonsRef?.filter((season) => !season.allReleasedEpisodesWatched)!
    return seasonsNotWatched[seasonsNotWatched.length - 1]?.season_number || 0
  }, [seasonsRef])

  if (!shouldToWatchShowRender(userShow)) {
    return null
  }

  return (
    <div className="towatch__show" data-index={showIndex}>
      <div className="towatch__show-name">
        <Link to={`/show/${showId}`}>{userShow.name}</Link>
      </div>
      <div ref={seasonsListRef} className="episodes">
        {seasonsRef?.map((season) => {
          return (
            <ToWatchSeason
              showData={userShow}
              seasonData={season}
              key={season.season_number}
              initialOpenSeasonNumber={initialOpenSeasonNumber}
              seasonsListRef={seasonsListRef}
              showsListRef={showsListRef}
              isCheckEpisodeAnimationRunning={isCheckEpisodeAnimationRunning}
              showIndex={showIndex}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ToWatchShow
