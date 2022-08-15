import { useAppDispatch, useAppSelector } from 'app/hooks'
import classNames from 'classnames'
import { EpisodesStoreState, ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectShowEpisodes, selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import React, { useState, useEffect, Children, useMemo } from 'react'
import { differenceInCalendarDays } from 'date-fns'
import { currentDate } from 'Utils'
import { shallowEqual } from 'react-redux'
import * as _isEqual from 'lodash.isequal'
import ToWatchEpisode from './ToWatchEpisode'
import { getSeasonEpisodes } from '../Helpers'

type Props = {
  seasonData: EpisodesStoreState
  showData: ShowFullDataStoreState
  children: React.ReactNode
}

const ToWatchSeason: React.FC<Props> = ({ showData, seasonData, children }) => {
  const [isOpen, setIsOpen] = useState(seasonData.season_number === 1)

  const dispatch = useAppDispatch()
  const isAllReleasedEpisodesWatched = useAppSelector((state) => {
    const season = selectSingleSeason(state, showData.id, seasonData.season_number)
    return season?.allReleasedEpisodesWatched
  })!

  const seasonEpisodes = dispatch(getSeasonEpisodes({ showId: showData.id, seasonNumber: seasonData.season_number }))
  // const seasonDataStore = useAppSelector((state) => {
  //   return selectSingleSeason(state, showData.id, seasonData.season_number)?.episodes
  // }, _isEqual)

  // useEffect(() => {
  //   console.log({ curr: seasonDataStore })

  //   return () => {
  //     console.log({ prev: seasonDataStore })
  //   }
  // }, [seasonDataStore])
  // const seasonEpisodesNotWatched = useMemo(() => {
  // return seasonDataStore?.episodes.filter(
  //   (episode) => !episode.watched && differenceInCalendarDays(new Date(episode.air_date), currentDate) <= 0,
  // )
  // }, [seasonDataStore])

  // const earliestNotWatched = seasonEpisodesNotWatched && seasonEpisodesNotWatched[0]

  // console.log(`rerender SEASON ${seasonData.season_number}`)

  if (isAllReleasedEpisodesWatched) {
    return null
  }

  return (
    <div className="episodes__episode-group">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={classNames('episodes__episode-group-info', {
          'episodes__episode-group-info--open': false,
        })}
      >
        <div className="episodes__episode-group-name">Season {seasonData.season_number}</div>
        <div className="episodes__episode-group-episodes-left">
          {/* {seasonEpisodesNotWatched?.length} episodes left <span>from {earliestNotWatched?.episode_number}</span> */}
        </div>
      </div>
      {isOpen && (
        <div className="episodes__episode-list">
          {seasonEpisodes?.map((episode) => {
            return <ToWatchEpisode key={episode.id} showId={showData.id} episodeData={episode} />
          })}
        </div>
      )}
    </div>
  )
}

export default ToWatchSeason
