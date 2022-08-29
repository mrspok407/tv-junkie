import { useAppSelector } from 'app/hooks'
import { SingleEpisodeStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleEpisode } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { differenceInCalendarDays, isValid } from 'date-fns'
import { currentDate } from 'Utils'

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

  const episodeReleaseDate = new Date(episodeData.air_date ?? '')
  const isEpisodeReleased = isValid(episodeReleaseDate)
    ? differenceInCalendarDays(episodeReleaseDate, currentDate) <= 0
    : true
  const shouldEpisodeRender = !isWatched && isEpisodeReleased

  return shouldEpisodeRender
}

export default useShouldToWatchEpisodeRender
