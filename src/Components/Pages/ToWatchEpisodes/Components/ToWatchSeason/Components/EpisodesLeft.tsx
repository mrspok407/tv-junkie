import React, { useMemo } from 'react'
import { useAppSelector } from 'app/hooks'
import { selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { differenceInCalendarDays, isValid } from 'date-fns'
import { currentDate } from 'Utils'
import { EpisodesStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'

type Props = {
  showId: number
  seasonData: EpisodesStoreState
}

const EpisodesLeft: React.FC<Props> = ({ showId, seasonData }) => {
  const seasonDataStore = useAppSelector((state) => selectSingleSeason(state, showId, seasonData.originalSeasonIndex))
  const seasonEpisodesNotWatched = useMemo(() => {
    return (
      seasonDataStore?.episodes.filter((episode) => {
        const episodeReleaseDate = new Date(episode.air_date ?? '')
        const isEpisodeReleased = isValid(episodeReleaseDate)
          ? differenceInCalendarDays(episodeReleaseDate, currentDate) <= 0
          : true
        return !episode.watched && isEpisodeReleased
      }) || []
    )
  }, [seasonDataStore])

  const fromEpisodeNumber = seasonEpisodesNotWatched[0]?.episode_number

  return (
    <div className="episodes__episode-group-episodes-left">
      {seasonEpisodesNotWatched?.length} episodes left <span>from episode {fromEpisodeNumber}</span>
    </div>
  )
}

export default EpisodesLeft
