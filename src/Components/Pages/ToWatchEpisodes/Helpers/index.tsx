import { AppThunk } from 'app/store'
import {
  EpisodesStoreState,
  ShowFullDataStoreState,
  SingleEpisodeStoreState,
} from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectShowEpisodes, selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { differenceInCalendarDays } from 'date-fns'
import { currentDate } from 'Utils'

interface GetSeasonsType {
  showId: number
}

interface GetEpisodesType extends GetSeasonsType {
  seasonNumber: number
}

export const getSeasons =
  ({ showId }: GetSeasonsType): AppThunk<EpisodesStoreState[] | undefined> =>
  (_, getState) => {
    const seasons = selectShowEpisodes(getState(), showId) ?? []
    return [...seasons].reverse()
  }

export const getSeasonEpisodes =
  ({ showId, seasonNumber }: GetEpisodesType): AppThunk<SingleEpisodeStoreState[] | undefined> =>
  (_, getState) => {
    const episodes = selectSingleSeason(getState(), showId, seasonNumber)?.episodes ?? []
    return [...episodes].reverse()
  }

export const shouldToWatchShowRender = (showData: ShowFullDataStoreState) => {
  return (
    showData?.allReleasedEpisodesWatched === false &&
    showData?.database === 'watchingShows' &&
    differenceInCalendarDays(new Date(showData.first_air_date), currentDate) <= 0
  )
}
