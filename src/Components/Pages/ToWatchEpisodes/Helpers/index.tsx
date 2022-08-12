import { AppThunk } from 'app/store'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { EpisodesStoreState, SingleEpisodeStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectShowEpisodes, selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'

interface GetSeasonsType {
  showId: number
}

interface GetEpisodesType extends GetSeasonsType {
  seasonNumber: number
}

export const getSeasons =
  ({ showId }: GetSeasonsType): AppThunk<EpisodesStoreState[] | undefined> =>
  (_, getState) => {
    const seasons = selectShowEpisodes(getState(), showId)
    return seasons
  }

export const getSeasonEpisodes =
  ({ showId, seasonNumber }: GetEpisodesType): AppThunk<SingleEpisodeStoreState[] | undefined> =>
  (_, getState) => {
    const episodes = selectSingleSeason(getState(), showId, seasonNumber)?.episodes
    return episodes
  }
