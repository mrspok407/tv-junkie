/* eslint-disable max-len */

import { PostUserShowScheme, UpdateUserShowStatusScheme } from '../@Types'

export const postUserShowScheme = ({
  authUid,
  showDetailesTMDB,
  showEpisodes,
  showDatabase,
  firebase,
}: PostUserShowScheme) => {
  const showsSubDatabase =
    showDetailesTMDB.status === 'Ended' || showDetailesTMDB.status === 'Canceled' ? 'ended' : 'ongoing'

  return {
    [`users/${authUid}/content/shows/${showDetailesTMDB.id}`]: {
      allEpisodesWatched: false,
      database: showDatabase,
      finished: false,
      firstAirDate: showDetailesTMDB.first_air_date,
      id: showDetailesTMDB.id,
      name: showDetailesTMDB.name,
      status: showsSubDatabase,
      timeStamp: firebase.timeStamp(),
    },
    [`users/${authUid}/content/episodes/${showDetailesTMDB.id}`]: {
      episodes: showEpisodes,
      info: {
        database: showDatabase,
        allEpisodesWatched: false,
        isAllWatched_database: `false_${showDatabase}`,
        finished: false,
      },
    },
    [`users/${authUid}/content/showsLastUpdateList/${showDetailesTMDB.id}/lastUpdatedInUser`]: firebase.timeStamp(),
    [`allShowsList/${showDetailesTMDB.id}/usersWatching`]: firebase.ServerValueIncrement(
      showDatabase === 'watchingShows' ? 1 : 0,
    ),
  }
}

export const updateUserShowStatusScheme = ({
  authUid,
  id,
  userShowStatus,
  showFromStore,
  showUserDatabase,
  firebase,
}: UpdateUserShowStatusScheme) => {
  const showData = showFromStore! || showUserDatabase!
  const updateUsersWatching = () => {
    if (userShowStatus === 'watchingShows') return 1
    if (showData.database !== 'watchingShows') return 0
    return -1
  }

  return {
    [`allShowsList/${id}/usersWatching`]: firebase.ServerValueIncrement(updateUsersWatching()),
    [`users/${authUid}/content/shows/${id}/database`]: userShowStatus,
    [`users/${authUid}/content/episodes/${id}/info/database`]: userShowStatus,
    [`users/${authUid}/content/episodes/${id}/info/isAllWatched_database`]: `${showData.allEpisodesWatched}_${userShowStatus}`,
  }
}
