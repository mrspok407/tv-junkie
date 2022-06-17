import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import getShowEpisodesTMDB from 'Components/UserContent/TmdbAPIHelpers/getShowEpisodesFromAPI'
import addShowToFireDatabase from 'Components/UserContent/FirebaseHelpers/addShowFireDatabase'

type PostShowFireDatabase = {
  firebase: FirebaseInterface
  showDetailesTMDB: MainDataTMDB
  database: string
}

const postShowFireDatabase = async ({ showDetailesTMDB, database, firebase }: PostShowFireDatabase) => {
  const showEpisodesTMDB = await getShowEpisodesTMDB({ id: showDetailesTMDB.id })
  const { snapshot } = await addShowToFireDatabase({
    firebase,
    database,
    showDetailesTMDB,
    showEpisodesTMDB,
  })

  return snapshot.val()
}

export default postShowFireDatabase
