import getShowEpisodesTMDB from 'Components/UserContent/TmdbAPIHelpers/getShowEpisodesFromAPI'
import * as ROLES from 'Utils/Constants/roles'
import { formatShowEpisodesForUserDatabase } from 'Utils/FormatTMDBAPIData'
import { PostUserDataOnRegister } from '../@Types'

export const postUserDataOnRegisterScheme = ({ authUserFirebase, userName, firebase }: PostUserDataOnRegister) => {
  const authUid = authUserFirebase.user.uid

  const userData = {
    username: userName,
    userNameLowerCase: userName.toLowerCase(),
    email: authUserFirebase.user.email,
    role: ROLES.USER,
  }

  const showEpisodesTMDB = await getShowEpisodesTMDB({ id: showDetailesTMDB.id })
  const showEpisodesUserDatabase = formatShowEpisodesForUserDatabase(episodesFromFireDatabase)

  return {
    [`allShowsList/${id}/usersWatching`]: firebase.ServerValueIncrement(updateUsersWatching()),
    [`users/${authUid}`]: userData,
    [`users/${authUid}/content/shows/${id}/database`]: userShowStatus,
    [`users/${authUid}/content/episodes/${id}/info/database`]: userShowStatus,
    [`users/${authUid}/content/episodes/${id}/info/isAllWatched_database`]: `${showFromStore.allEpisodesWatched}_${userShowStatus}`,
  }
}
