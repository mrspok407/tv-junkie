import { useAppSelector } from 'app/hooks'
import { EpisodesStoreState, ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { isValid } from 'date-fns'
import { isContentReleased } from 'Utils'

type Props = {
  seasonData: EpisodesStoreState
  showData: ShowFullDataStoreState
}

const useShouldToWatchSeasonRender = ({ seasonData, showData }: Props) => {
  const [isAllReleasedEpisodesWatched, isValidEpisodesExists] = useAppSelector((state) => {
    const season = selectSingleSeason(state, showData.id, seasonData.originalSeasonIndex)
    const isValidEpisodesExists = season?.episodes.some((episode) => isValid(new Date(episode.air_date ?? ''))) ?? false
    return [season?.allReleasedEpisodesWatched, isValidEpisodesExists]
  })!
  console.log(isValidEpisodesExists)
  let [isSeasonReleased] = isContentReleased(seasonData.air_date)
  isSeasonReleased = isSeasonReleased || isValidEpisodesExists
  const shouldSeasonRender = !isAllReleasedEpisodesWatched && isSeasonReleased

  return shouldSeasonRender
}

export default useShouldToWatchSeasonRender
