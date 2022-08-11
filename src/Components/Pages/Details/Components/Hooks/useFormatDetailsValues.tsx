import { useMemo } from 'react'
import { formatGenres, formatNetworks } from 'Utils/FormatTMDBAPIData'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

type Props = {
  details: MainDataTMDB
  isMediaTypeTV: boolean
}

const useFormatDetailsValues = ({ details, isMediaTypeTV }: Props) => {
  const tvNetworks: string = useMemo(() => formatNetworks(details.networks), [details.networks])
  const movieProdCompanies: string = useMemo(
    () => formatNetworks(details.production_companies),
    [details.production_companies],
  )
  const companyName: string = isMediaTypeTV ? tvNetworks : movieProdCompanies

  const genres: string = useMemo(() => formatGenres(details.genres), [details.genres])
  const title: string = isMediaTypeTV ? details.name : details.title

  const yearRelease: string = isMediaTypeTV
    ? details.first_air_date?.slice(0, 4) ?? ''
    : details.release_date?.slice(0, 4)
  const yearEnded: string = isMediaTypeTV ? details.last_air_date?.slice(0, 4) ?? '' : ''

  let yearRange: string
  if (['Ended', 'Canceled'].includes(details.status)) {
    yearRange = yearRelease === yearEnded ? yearRelease : `${yearRelease} - ${yearEnded}`
  } else {
    yearRange = `${yearRelease} - ...`
  }

  const runtime: number = isMediaTypeTV ? details.episode_run_time[0] : details.runtime || 0

  return {
    companyName,
    genres,
    title,
    yearRelease,
    yearEnded,
    yearRange,
    runtime,
  }
}

export default useFormatDetailsValues
