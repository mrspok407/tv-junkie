import { useMemo } from 'react'
import { formatGenres, formatNetworks } from 'Utils/FormatTMDBAPIData'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

type Props = {
  detailes: MainDataTMDB
  isMediaTypeTV: boolean
}

const useFormatDetailesValues = ({ detailes, isMediaTypeTV }: Props) => {
  const tvNetworks: string = useMemo(() => formatNetworks(detailes.networks), [detailes.networks])
  const movieProdCompanies: string = useMemo(
    () => formatNetworks(detailes.production_companies),
    [detailes.production_companies],
  )
  const companyName: string = isMediaTypeTV ? tvNetworks : movieProdCompanies

  const genres: string = useMemo(() => formatGenres(detailes.genres), [detailes.genres])
  const title: string = isMediaTypeTV ? detailes.name : detailes.title

  const yearRelease: string = isMediaTypeTV
    ? detailes.first_air_date?.slice(0, 4) ?? ''
    : detailes.release_date?.slice(0, 4)
  const yearEnded: string = isMediaTypeTV ? detailes.last_air_date?.slice(0, 4) ?? '' : ''
  const yearRange: string = ['Ended', 'Canceled'].includes(detailes.status)
    ? `${yearRelease} - ${yearEnded}`
    : `${yearRelease} - ...`

  const runtime: number = isMediaTypeTV ? detailes.episode_run_time[0] : detailes.runtime || 0

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

export default useFormatDetailesValues
