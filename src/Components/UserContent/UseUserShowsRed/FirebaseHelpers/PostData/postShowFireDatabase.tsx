import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import getShowEpisodesTMDB from 'Components/UserContent/TmdbAPIHelpers/getShowEpisodesFromAPI'
import addShowToFireDatabase from 'Components/UserContent/FirebaseHelpers/addShowFireDatabase'

type PostShowFireDatabase = {
  firebase: FirebaseInterface
  showDetailsTMDB: MainDataTMDB
}

const postShowFireDatabase = async ({ showDetailsTMDB, firebase }: PostShowFireDatabase) => {
  const showEpisodesTMDB = await getShowEpisodesTMDB({ id: showDetailsTMDB.id })
  const { snapshot } = await addShowToFireDatabase({
    firebase,
    showDetailsTMDB,
    showEpisodesTMDB,
  })

  return snapshot.val()
}

export default postShowFireDatabase
