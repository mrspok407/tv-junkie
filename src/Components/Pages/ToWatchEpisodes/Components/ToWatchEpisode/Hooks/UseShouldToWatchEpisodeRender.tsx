import { useAppSelector } from 'app/hooks'
import { SingleEpisodeStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleEpisode } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { isContentReleased } from 'Utils'

type Props = {
  episodeData: SingleEpisodeStoreState
  showId: number
}

const useShouldToWatchEpisodeRender = ({ episodeData, showId }: Props) => {
  const isWatched = useAppSelector((state) => {
    const episode = selectSingleEpisode(
      state,
      showId,
      episodeData.originalSeasonIndex,
      episodeData.originalEpisodeIndex,
    )
    return episode?.watched ?? false
  })

  const [isEpisodeReleased, isEpisodeDateValid] = isContentReleased(episodeData.air_date)
  const shouldEpisodeRender = !isWatched && isEpisodeReleased && isEpisodeDateValid

  return shouldEpisodeRender
}

export default useShouldToWatchEpisodeRender
