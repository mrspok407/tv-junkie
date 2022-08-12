import { useAppSelector } from 'app/hooks'
import classNames from 'classnames'
import { EpisodesStoreState, ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectShowEpisodes, selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import React, { useState, useEffect, Children, useMemo } from 'react'
import { differenceInCalendarDays } from 'date-fns'
import { currentDate } from 'Utils'

type Props = {
  seasonData: EpisodesStoreState
  showData: ShowFullDataStoreState
  children: React.ReactNode
}

const ToWatchSeason: React.FC<Props> = ({ showData, seasonData, children }) => {
  const seasonDataStore = useAppSelector((state) => selectSingleSeason(state, showData.id, seasonData.season_number))
  const seasonEpisodesNotWatched = useMemo(() => {
    return seasonDataStore?.episodes.filter(
      (episode) => !episode.watched && differenceInCalendarDays(new Date(episode.air_date), currentDate) <= 0,
    )
  }, [seasonDataStore])

  const earliestNotWatched = seasonEpisodesNotWatched && seasonEpisodesNotWatched[0]

  console.log('rerender SEASON')

  if (!seasonEpisodesNotWatched?.length) {
    return null
  }

  return (
    <div className="episodes__episode-group">
      <div
        className={classNames('episodes__episode-group-info', {
          'episodes__episode-group-info--open': false,
        })}
      >
        <div className="episodes__episode-group-name">Season {seasonData.season_number}</div>
        <div className="episodes__episode-group-episodes-left">
          {seasonEpisodesNotWatched?.length} episodes left <span>from {earliestNotWatched?.episode_number}</span>
        </div>
      </div>
      <div className="episodes__episode-list">{children}</div>
    </div>
  )
}

export default ToWatchSeason
