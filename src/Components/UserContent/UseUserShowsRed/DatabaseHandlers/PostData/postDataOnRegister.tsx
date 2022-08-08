import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import addShowToFireDatabase from 'Components/UserContent/FirebaseHelpers/addShowFireDatabase'
import getShowEpisodesTMDB, { ShowEpisodesTMDB } from 'Components/UserContent/TmdbAPIHelpers/getShowEpisodesFromAPI'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

interface PostMultiplyShowsFireDatabaseInt {
  shows: MainDataTMDB[]
  episodesData: ShowEpisodesTMDB[]
  firebase: FirebaseInterface
}

export const postMultiplyShowsFireDatabase = async ({
  shows,
  episodesData,
  firebase,
}: PostMultiplyShowsFireDatabaseInt) => {
  await Promise.all(
    shows.map((show) => {
      return addShowToFireDatabase({
        firebase,
        showDetailesTMDB: show,
        showEpisodesTMDB: episodesData.find((item) => item.showId === show.id)!,
      })
    }),
  )
}

export const getEpisodesFullData = async (shows: MainDataTMDB[]) => {
  return Promise.all(
    shows.map((show) => {
      return getShowEpisodesTMDB({ id: show.id })
    }),
  )
}
