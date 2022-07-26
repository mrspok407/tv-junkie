import { move } from 'formik'
import { removeUndefinedNullFromObject } from 'Utils'
import * as ROLES from 'Utils/Constants/roles'
import {
  DataOnRegisterEpisodesFullData,
  DataOnRegisterMovieInfo,
  DataOnRegisterShowInfo,
  PostUserDataOnRegister,
} from '../@Types'
import { formatMovieForPostFirebase } from './Helpers'

export const postUserDataOnRegisterScheme = ({
  authUserFirebase,
  userName,
  selectedShows,
  episodes,
  episodesInfo,
  watchLaterMovies,
  firebase,
}: PostUserDataOnRegister) => {
  const authUid = authUserFirebase.user.uid
  const userData = {
    [`users/${authUid}/username`]: userName,
    [`users/${authUid}/userNameLowerCase`]: userName.toLowerCase(),
    [`users/${authUid}/email`]: authUserFirebase.user.email,
    [`users/${authUid}/role`]: ROLES.USER,
  }

  const moviesData: DataOnRegisterMovieInfo = {}

  const episodesData: DataOnRegisterEpisodesFullData = {}
  const showsInfo: DataOnRegisterShowInfo = {}
  const showsLastUpdated: { [key: string]: { lastUpdatedInUser: number } } = {}

  const showsFireDatabaseUsersWatching: { [key: string]: number } = {}

  selectedShows.forEach((show) => {
    episodesData[show.id] = {
      episodes: episodes[show.id],
      info: episodesInfo[show.id],
    }

    showsInfo[show.id] = {
      allEpisodesWatched: false,
      database: show.database,
      finished: false,
      firstAirDate: show.first_air_date,
      id: show.id,
      name: show.name,
      status: show.status === 'Ended' || show.status === 'Canceled' ? 'ended' : 'ongoing',
      timeStamp: firebase.timeStamp(),
      userRating: '',
      key: show.id.toString(),
    }
    showsLastUpdated[show.id] = {
      lastUpdatedInUser: firebase.timeStamp(),
    }
    showsFireDatabaseUsersWatching[`allShowsList/${show.id}/usersWatching`] = firebase.ServerValueIncrement(1)
  })

  watchLaterMovies.forEach((movie) => {
    moviesData[movie.id] = formatMovieForPostFirebase({ data: movie, firebase })
  })

  return {
    ...showsFireDatabaseUsersWatching,
    ...userData,
    [`users/${authUid}/content/episodes`]: removeUndefinedNullFromObject(episodesData),
    [`users/${authUid}/content/shows`]: removeUndefinedNullFromObject(showsInfo),
    [`users/${authUid}/content/movies/watchLaterMovies`]: removeUndefinedNullFromObject(moviesData),
    [`users/${authUid}/content/showsLastUpdateList`]: showsLastUpdated,
  }
}
