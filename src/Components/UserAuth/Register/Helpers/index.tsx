import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { DataOnRegisterEpisodes, DataOnRegisterEpisodesInfo } from 'Components/Firebase/FirebasePostSchemes/@Types'
import { ShowEpisodesTMDB } from 'Components/UserContent/TmdbAPIHelpers/getShowEpisodesFromAPI'
import {
  getEpisodesFullData,
  postMultiplyShowsFireDatabase,
} from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/PostData/postDataOnRegister'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { formatEpisodesInfoForUserDatabase, formatShowEpisodesForUserDatabase } from 'Utils/FormatTMDBAPIData'

export const handleContentOnRegister = async (shows: MainDataTMDB[], firebase: FirebaseInterface) => {
  const episodesData = await getEpisodesFullData(shows)
  await postMultiplyShowsFireDatabase({ shows, episodesData, firebase })
  return episodesData
}

export const formatEpisodesForUserDatabaseOnRegister = (shows: MainDataTMDB[], episodesData: ShowEpisodesTMDB[]) => {
  const episodesForUserDatabase: DataOnRegisterEpisodes = {}
  const episodesInfoForUserDatabase: DataOnRegisterEpisodesInfo = {}

  episodesData.forEach((show) => {
    const showEpisodesUserDatabase = formatShowEpisodesForUserDatabase(show.episodes)
    const showInfoEpisodesUserDatabase = formatEpisodesInfoForUserDatabase(
      shows.find((item) => item.id === show.showId)!,
    )
    episodesForUserDatabase[show.showId] = showEpisodesUserDatabase
    episodesInfoForUserDatabase[show.showId] = showInfoEpisodesUserDatabase
  })
  return {
    episodesForUserDatabase,
    episodesInfoForUserDatabase,
  }
}
