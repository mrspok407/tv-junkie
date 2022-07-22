// /* eslint-disable import/no-cycle */
// import { useEffect, useState } from 'react'
// import { releasedEpisodesToOneArray } from 'Utils'
// import { AuthUserInterface } from 'Components/UserAuth/Session/Authentication/@Types'
// import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
// import { SeasonEpisodesFromDatabaseInterface } from '../UseUserShows'

// type Hook = () => {
//   userToWatchShows: UserToWatchShowsInterface[]
//   loadingNotFinishedShows: boolean
//   listenerUserToWatchShow: ({ uid }: AuthUserInterface['authUser']) => void
//   resetStateToWatchShows: () => void
// }

// export interface UserToWatchShowsInterface {
//   id: number
//   episodes: SeasonEpisodesFromDatabaseInterface[]
// }

// const useGetUserToWatchShows: Hook = () => {
//   const { firebase, authUser } = useFrequentVariables()

//   const [userToWatchShows, setUserToWatchShows] = useState<UserToWatchShowsInterface[]>([])
//   const [loadingNotFinishedShows, setLoadingNotFinishedShows] = useState(false)

//   useEffect(
//     () => () => {
//       if (!authUser?.uid) return

//       firebase
//         .showsEpisodesUserDatabase(authUser.uid)
//         .orderByChild('info/isAllWatched_database')
//         .equalTo('false_watchingShows')
//         .off()
//     },
//     [firebase, authUser],
//   )

//   const listenerUserToWatchShow = ({ uid }: AuthUserInterface['authUser']) => {
//     setLoadingNotFinishedShows(true)
//     firebase
//       .showsEpisodesUserDatabase(uid)
//       .orderByChild('info/isAllWatched_database')
//       .equalTo('false_watchingShows')
//       .on('value', (snapshot: { val: () => { id: number; episodes: Record<string, unknown>[] } }) => {
//         if (snapshot.val() === null) {
//           setUserToWatchShows([])
//           setLoadingNotFinishedShows(false)
//           return
//         }
//         const userEpisodes: UserToWatchShowsInterface[] = Object.entries(snapshot.val()).reduce(
//           (acc: UserToWatchShowsInterface[], [key, value]: any) => {
//             const releasedEpisodes: { watched: boolean }[] = releasedEpisodesToOneArray({
//               data: value.episodes,
//             })
//             if (releasedEpisodes.find((episode) => !episode.watched)) {
//               acc.push({ id: Number(key), episodes: value.episodes })
//             }
//             return acc
//           },
//           [],
//         )

//         setUserToWatchShows(userEpisodes)
//         setLoadingNotFinishedShows(false)
//       })
//   }

//   const resetStateToWatchShows = () => {
//     setUserToWatchShows([])
//   }

//   return {
//     userToWatchShows,
//     loadingNotFinishedShows,
//     listenerUserToWatchShow,
//     resetStateToWatchShows,
//   }
// }

// export default useGetUserToWatchShows
