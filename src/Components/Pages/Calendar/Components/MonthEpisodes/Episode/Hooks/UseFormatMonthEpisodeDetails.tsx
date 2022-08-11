import { SingleEpisodeByMonthInterface } from 'Components/UserContent/UseUserShowsRed/@Types'
import { differenceInCalendarDays, format } from 'date-fns'
import { currentDate } from 'Utils'

type Props = {
  episodeData: SingleEpisodeByMonthInterface
}

const useFormatMonthEpisodeDetails = ({ episodeData }: Props) => {
  const episodeAirDate = episodeData.air_date ? format(new Date(episodeData.air_date), 'd, EEE') : 'No date available'

  const seasonAsString = episodeData.season_number?.toString() ?? ''
  const episodeAsString = episodeData.episode_number?.toString() ?? ''

  const seasonNumber = 's'.concat(seasonAsString)
  const episodeNumber = episodeAsString.length === 1 ? 'e0'.concat(episodeAsString) : 'e'.concat(episodeAsString)

  const daysToNewEpisode = differenceInCalendarDays(new Date(episodeData.air_date), currentDate)
  const willAirToday = daysToNewEpisode === 0

  const handleDaysToNewEpisode = () => {
    if (daysToNewEpisode > 1) {
      return `${daysToNewEpisode} days`
    }
    if (daysToNewEpisode === 1) {
      return '1 day'
    }
    if (willAirToday) {
      return 'Today'
    }
  }

  return { episodeAirDate, seasonNumber, episodeNumber, daysToNewEpisode, willAirToday, handleDaysToNewEpisode }
}

export default useFormatMonthEpisodeDetails
