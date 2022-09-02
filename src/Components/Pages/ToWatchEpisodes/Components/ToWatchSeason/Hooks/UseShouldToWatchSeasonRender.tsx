import { useAppSelector } from 'app/hooks'
import { EpisodesStoreState, ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { isContentReleasedValid } from 'Utils'

type Props = {
  seasonData: EpisodesStoreState
  showData: ShowFullDataStoreState
}

const useShouldToWatchSeasonRender = ({ seasonData, showData }: Props) => {
  const [isAllReleasedEpisodesWatched, isValidEpisodeExists] = useAppSelector((state) => {
    const season = selectSingleSeason(state, showData.id, seasonData.originalSeasonIndex)

    const isValidEpisodeExists = season?.episodes.some((episode) => {
      const [isEpisodeReleased, isEpisodeDateValid] = isContentReleasedValid(episode.air_date)
      return isEpisodeReleased && isEpisodeDateValid
    })
    return [season?.allReleasedEpisodesWatched, isValidEpisodeExists]
  })!

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
