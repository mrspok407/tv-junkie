import { useAppSelector } from 'app/hooks'
import { EpisodesStoreState, ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { isContentReleased } from 'Utils'

type Props = {
  seasonData: EpisodesStoreState
  showData: ShowFullDataStoreState
}

const useShouldToWatchSeasonRender = ({ seasonData, showData }: Props) => {
  const isAllReleasedEpisodesWatched = useAppSelector((state) => {
    const season = selectSingleSeason(state, showData.id, seasonData.originalSeasonIndex)
    return season?.allReleasedEpisodesWatched
  })!
  const isSeasonReleased = isContentReleased(seasonData.air_date)
  const shouldSeasonRender = !isAllReleasedEpisodesWatched && isSeasonReleased

  return shouldSeasonRender
}

export default useShouldToWatchSeasonRender
