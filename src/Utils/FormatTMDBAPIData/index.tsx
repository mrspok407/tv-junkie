import { LIST_OF_GENRES } from 'Utils/Constants'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

export const formatMovieBudget = (budget: number) => {
  if (budget === 0 || typeof budget !== 'number') return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })
    .format(budget)
    .slice(0, -3)
    .split(',')
    .join('.')
}

export const formatNetworks = (data: MainDataTMDB['networks']) => {
  if (!Array.isArray(data)) return ''
  return data.map((item) => item?.name).join(', ')
}

export const formatGenres = (data: MainDataTMDB['genres']) => {
  if (!Array.isArray(data)) return ''
  return data.map((item) => item?.name).join(', ')
}

export const getGenresFromIds = (data: MainDataTMDB['genre_ids']) => {
  if (!Array.isArray(data)) return []
  return data.reduce((acc, genreId) => {
    const genreInfo = LIST_OF_GENRES.find((item) => item.id === genreId)
    if (genreInfo === undefined) {
      return acc
    } else {
      acc.push(genreInfo)
      return acc
    }
  }, [] as MainDataTMDB['genres'])
}
