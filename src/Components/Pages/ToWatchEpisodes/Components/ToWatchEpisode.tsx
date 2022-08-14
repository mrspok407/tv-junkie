import { useAppSelector } from 'app/hooks'
import EpisodeCheckbox from 'Components/UI/Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/Components/Episode/Components/EpisodeCheckbox/EpisodeCheckbox'
import { SingleEpisodeStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleEpisode } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { differenceInCalendarDays } from 'date-fns'
import React, { useState, useEffect } from 'react'
import { currentDate } from 'Utils'
import * as _isEqual from 'lodash.isequal'

type Props = {
  episodeData: SingleEpisodeStoreState
  showId: number
}

const ToWatchEpisode: React.FC<Props> = React.memo(({ episodeData, showId }) => {
  console.log('rerender ToWatchEpisode')
  // const isWatched = useAppSelector((state) => {
  //   const episode = selectSingleEpisode(state, showId, episodeData.season_number, episodeData.episode_number)
  //   return episode?.watched ?? false
  // })

  // if (isWatched || differenceInCalendarDays(new Date(episodeData.air_date), currentDate) > 0) return null

  return (
    <>
      <EpisodeCheckbox isDisabled={false} episodeData={episodeData} showId={showId} />
    </>
  )
}, _isEqual)

export default ToWatchEpisode
