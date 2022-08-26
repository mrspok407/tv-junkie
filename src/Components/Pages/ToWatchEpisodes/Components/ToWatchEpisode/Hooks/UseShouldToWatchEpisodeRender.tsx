import { useAppSelector } from 'app/hooks'
import { SingleEpisodeStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleEpisode } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { differenceInCalendarDays } from 'date-fns'
import { currentDate } from 'Utils'

type Props = {
  episodeData: SingleEpisodeStoreState
  showId: number
}

const useShouldToWatchEpisodeRender = ({ episodeData, showId }: Props) => {
  const isWatched = useAppSelector((state) => {
    const episode = selectSingleEpisode(state, showId, episodeData.season_number, episodeData.episode_number)
    return episode?.watched ?? false
  })

  const isEpisodeReleased = differenceInCalendarDays(new Date(episodeData.air_date), currentDate) <= 0
  const shouldEpisodeRender = !isWatched && isEpisodeReleased

  return shouldEpisodeRender
}

export default useShouldToWatchEpisodeRender
