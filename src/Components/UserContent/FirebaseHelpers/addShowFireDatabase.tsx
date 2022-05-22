import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { ContentDetailes } from 'Utils/Interfaces/ContentDetails'

type Arguments = {
  firebase: FirebaseInterface
  showDetailes: ContentDetailes
  showEpisodesTMDB: { status: string; episodes: {}[] }
}

const addShowFireDatabase = ({ firebase, showDetailes, showEpisodesTMDB }: Arguments): Promise<any> => firebase.showFullData(showDetailes.id).transaction((snapshot: any) => {
    if (snapshot !== null) {
      return
    }
    return {
      info: {
        backdrop_path: showDetailes.backdrop_path,
        first_air_date: showDetailes.first_air_date,
        genre_ids: showDetailes.genre_ids,
        id: showDetailes.id,
        name: showDetailes.name,
        original_name: showDetailes.original_name,
        overview: showDetailes.overview,
        poster_path: showDetailes.poster_path,
        vote_average: showDetailes.vote_average,
        vote_count: showDetailes.vote_count,
        status: showEpisodesTMDB.status,
        lastUpdatedInDatabase: firebase.timeStamp(),
      },
      episodes: showEpisodesTMDB.episodes,
      id: showDetailes.id.toString(),
      status: showEpisodesTMDB.status,
    }
  })

export default addShowFireDatabase
