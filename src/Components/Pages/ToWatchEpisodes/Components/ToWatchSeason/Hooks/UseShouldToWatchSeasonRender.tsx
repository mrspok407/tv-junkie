import { useAppSelector } from 'app/hooks'
import { EpisodesStoreState, ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { differenceInCalendarDays } from 'date-fns'
import { currentDate } from 'Utils'

type Props = {
  seasonData: EpisodesStoreState
  showData: ShowFullDataStoreState
}

const useShouldToWatchSeasonRender = ({ seasonData, showData }: Props) => {
  const isAllReleasedEpisodesWatched = useAppSelector((state) => {
    const season = selectSingleSeason(state, showData.id, seasonData.season_number)
    return season?.allReleasedEpisodesWatched
  })!
  const isSeasonReleased = differenceInCalendarDays(new Date(seasonData.air_date), currentDate) <= 0
  const shouldSeasonRender = !isAllReleasedEpisodesWatched && isSeasonReleased

  return shouldSeasonRender
}

export default useShouldToWatchSeasonRender
