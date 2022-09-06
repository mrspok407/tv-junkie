import { useMemo } from 'react'
import { useAppSelector } from 'app/hooks'
import { EpisodesStoreState, ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectShouldSeasonRender } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { isContentReleasedValid } from 'Utils'

type Props = {
  seasonData: EpisodesStoreState
  showData: ShowFullDataStoreState
}

const useShouldToWatchSeasonRender = ({ seasonData, showData }: Props) => {
  const shouldSeasonRenderSelector = useMemo(selectShouldSeasonRender, [])
  const [isAllReleasedEpisodesWatched, isValidEpisodeExists] = useAppSelector((state) =>
    shouldSeasonRenderSelector(state, showData.id, seasonData.originalSeasonIndex),
  )

  const [isSeasonReleased, isSeasonDateValid] = isContentReleasedValid(seasonData.air_date)
  let shouldSeasonRender: boolean

  if (!isSeasonDateValid) {
    shouldSeasonRender = !isAllReleasedEpisodesWatched && !!isValidEpisodeExists
  } else {
    if (isSeasonReleased) {
      shouldSeasonRender = !isAllReleasedEpisodesWatched && !!isValidEpisodeExists
    } else {
      shouldSeasonRender = false
    }
  }

  return shouldSeasonRender
}

export default useShouldToWatchSeasonRender
