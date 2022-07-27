import { MovieInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { removeUndefinedNullFromObject } from 'Utils'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

interface FormatMovieForPostFirebaseInt {
  data: MainDataTMDB
  firebase: FirebaseInterface
}
export const formatMovieForPostFirebase = ({
  data,
  firebase,
}: FormatMovieForPostFirebaseInt): MovieInfoFromUserDatabase => {
  return removeUndefinedNullFromObject({
    backdrop_path: data.backdrop_path,
    genres: data.genres,
    id: data.id,
    overview: data.overview,
    release_date: data.release_date,
    title: data.title,
    vote_average: data.vote_average,
    vote_count: data.vote_count,
    timeStamp: firebase.timeStamp(),
    finished: false,
    userRating: '',
    key: data.id.toString(),
  })
}
