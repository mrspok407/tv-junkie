import { useAppSelector } from 'app/hooks'
import { selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { differenceInCalendarDays } from 'date-fns'
import React, { useState, useEffect, useMemo } from 'react'
import { currentDate } from 'Utils'
import * as _isEqual from 'lodash.isequal'

type Props = {
  showId: number
  seasonNumber: number
}

const EpisodesLeft: React.FC<Props> = ({ showId, seasonNumber }) => {
  const seasonDataStore = useAppSelector((state) => selectSingleSeason(state, showId, seasonNumber))
  const seasonEpisodesNotWatched = useMemo(() => {
    return (
      seasonDataStore?.episodes.filter(
        (episode) => !episode.watched && differenceInCalendarDays(new Date(episode.air_date), currentDate) <= 0,
      ) || []
    )
  }, [seasonDataStore])

  const fromEpisodeNumber = seasonEpisodesNotWatched[0]?.episode_number

  console.log({ seasonEpisodesNotWatched })

  return (
    <div className="episodes__episode-group-episodes-left">
      {seasonEpisodesNotWatched?.length} episodes left <span>from episode {fromEpisodeNumber}</span>
    </div>
  )
}

export default EpisodesLeft
