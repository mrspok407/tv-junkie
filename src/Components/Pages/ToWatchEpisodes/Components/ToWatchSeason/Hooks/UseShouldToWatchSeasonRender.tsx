import { useAppSelector } from 'app/hooks'
import { EpisodesStoreState, ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { differenceInCalendarDays, isValid } from 'date-fns'
import { currentDate } from 'Utils'

type Props = {
  seasonData: EpisodesStoreState
  showData: ShowFullDataStoreState
}

const useShouldToWatchSeasonRender = ({ seasonData, showData }: Props) => {
  const isAllReleasedEpisodesWatched = useAppSelector((state) => {
    const season = selectSingleSeason(state, showData.id, seasonData.originalSeasonIndex)
    return season?.allReleasedEpisodesWatched
  })!
  const seasonReleaseDate = new Date(seasonData?.air_date ?? '')
  const isSeasonReleased = isValid(seasonReleaseDate)
    ? differenceInCalendarDays(seasonReleaseDate, currentDate) <= 0
    : true
  console.log(differenceInCalendarDays(seasonReleaseDate, currentDate))
  const shouldSeasonRender = !isAllReleasedEpisodesWatched && isSeasonReleased

  return shouldSeasonRender
}

export default useShouldToWatchSeasonRender
