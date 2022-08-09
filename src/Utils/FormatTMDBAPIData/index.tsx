import { LIST_OF_GENRES } from 'Utils/Constants'
import { EpisodesTMDB, MainDataTMDB } from 'Utils/@TypesTMDB'
import { EpisodesFromUserDatabase } from 'Components/Firebase/@TypesFirebase'

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

export const formatShowEpisodesForUserDatabase = (
  episodesData: EpisodesTMDB[],
): EpisodesFromUserDatabase['episodes'] => {
  if (!Array.isArray(episodesData)) {
    throw new Error('Episodes should be an array.')
  }
  const formattedEpisodes = episodesData.reduce((acc: EpisodesFromUserDatabase['episodes'], season) => {
    const episodes = season.episodes.map((episode) => ({
      watched: false,
      userRating: 0,
      air_date: episode.air_date || '',
    }))
    acc.push({ season_number: season.season_number, episodes, userRating: 0 })
    return acc
  }, [])
  return formattedEpisodes
}

export const formatEpisodesInfoForUserDatabase = (showDetailes: MainDataTMDB): EpisodesFromUserDatabase['info'] => {
  return {
    database: showDetailes.database,
    allEpisodesWatched: false,
    isAllWatched_database: `false_${showDetailes.database}`,
    finished: false,
  }
}
