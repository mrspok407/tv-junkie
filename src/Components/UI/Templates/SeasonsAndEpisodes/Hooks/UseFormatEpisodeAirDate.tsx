import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import { differenceInCalendarDays } from 'date-fns'
import format from 'date-fns/format'
import { currentDate } from 'Utils'

type Props = {
  episodeData: SingleEpisodeFromFireDatabase
}

const useFormatEpisodeAirDate = ({ episodeData }: Props) => {
  const airDateReadable = episodeData.air_date
    ? format(new Date(episodeData.air_date), 'MMMM d, yyyy')
    : 'No date available'

  const daysToNewEpisode = differenceInCalendarDays(new Date(episodeData.air_date), currentDate)
  const isEpisodeAired = daysToNewEpisode <= 0
  const airDateUnavailable = !episodeData?.air_date

  return [airDateReadable, daysToNewEpisode, isEpisodeAired, airDateUnavailable] as const
}

export default useFormatEpisodeAirDate
