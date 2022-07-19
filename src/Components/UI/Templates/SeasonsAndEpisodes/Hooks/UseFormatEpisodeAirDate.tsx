import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'

type Props = {
  episodeData: SingleEpisodeFromFireDatabase
}

const useFormatEpisodeAirDate = ({ episodeData }: Props) => {
  const airDateISO = new Date(episodeData.air_date ?? '').toISOString()

  const options: any = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }

  const formatedDate = new Date(airDateISO as string)

  const episodeAirDate = episodeData.air_date
    ? new Intl.DateTimeFormat('en-US', options).format(formatedDate as Date)
    : 'No date available'
  // Format Date End //

  const episodeAirDateAsDateObj = new Date(episodeData.air_date)

  return [episodeAirDate, episodeAirDateAsDateObj] as const
}

export default useFormatEpisodeAirDate
