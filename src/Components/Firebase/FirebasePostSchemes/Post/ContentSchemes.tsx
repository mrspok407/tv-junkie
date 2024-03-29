/* eslint-disable max-len */

import {
  PostUserMovieScheme,
  PostUserShowScheme,
  UpdateUserShowStatusScheme,
  PostCheckAllReleasedEpisodesScheme,
  DataCheckAllReleasedEpisodes,
} from '../@Types'
import { formatMovieForPostFirebase } from './Helpers'

export const postUserShowScheme = ({
  authUid,
  showDetailsTMDB,
  showEpisodes,
  showDatabase,
  firebase,
}: PostUserShowScheme) => {
  const showsSubDatabase =
    showDetailsTMDB.status === 'Ended' || showDetailsTMDB.status === 'Canceled' ? 'ended' : 'ongoing'

  return {
    [`users/${authUid}/content/shows/${showDetailsTMDB.id}`]: {
      allEpisodesWatched: false,
      database: showDatabase,
      finished: false,
      firstAirDate: showDetailsTMDB.first_air_date,
      id: showDetailsTMDB.id,
      name: showDetailsTMDB.name,
      status: showsSubDatabase,
      timeStamp: firebase.timeStamp(),
    },
    [`users/${authUid}/content/episodes/${showDetailsTMDB.id}`]: {
      episodes: showEpisodes,
      info: {
        database: showDatabase,
        allEpisodesWatched: false,
        isAllWatched_database: `false_${showDatabase}`,
        finished: false,
      },
    },
    [`users/${authUid}/content/showsLastUpdateList/${showDetailsTMDB.id}/lastUpdatedInUser`]: firebase.timeStamp(),
    [`allShowsList/${showDetailsTMDB.id}/usersWatching`]: firebase.ServerValueIncrement(
      showDatabase === 'watchingShows' ? 1 : 0,
    ),
    [`allShowsList/${showDetailsTMDB.id}/usersWatchingList/${authUid}`]: true,
  }
}

export const updateUserShowStatusScheme = ({
  authUid,
  id,
  userShowStatus,
  showFromStore,
  firebase,
}: UpdateUserShowStatusScheme) => {
  const updateUsersWatching = () => {
    if (userShowStatus === 'watchingShows') return 1
    if (showFromStore.database !== 'watchingShows') return 0
    return -1
  }

  return {
    [`allShowsList/${id}/usersWatching`]: firebase.ServerValueIncrement(updateUsersWatching()),
    [`users/${authUid}/content/shows/${id}/database`]: userShowStatus,
  }
}

export const postCheckReleasedEpisodesScheme = ({
  authUid,
  showId,
  releasedEpisodes,
  isWatched,
}: PostCheckAllReleasedEpisodesScheme) => {
  const updateData: DataCheckAllReleasedEpisodes = {}
  releasedEpisodes.forEach((episode) => {
    const seasonNumber = episode.originalSeasonIndex
    const episodeNumber = episode.originalEpisodeIndex
    updateData[
      `users/${authUid}/content/episodes/${showId}/episodes/${seasonNumber}/episodes/${episodeNumber}/watched`
    ] = isWatched
  })
  return updateData
}

export const postUserMovieScheme = ({ authUid, movieDetailsTMDB, firebase }: PostUserMovieScheme) => {
  return {
    [`users/${authUid}/content/movies/watchLaterMovies/${movieDetailsTMDB.id}`]: formatMovieForPostFirebase({
      data: movieDetailsTMDB,
      firebase,
    }),
  }
}
