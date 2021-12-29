import { AppThunk } from "app/store"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import addShowFireDatabase from "Components/UserContent/FirebaseHelpers/addShowFireDatabase"
import getShowEpisodesFromAPI from "Components/UserContent/TmdbAPIHelpers/getShowEpisodesFromAPI"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"
import { selectShow, setError } from "../../userShowsSliceRed"

interface HandleDatbaseChange {
  id: number
  database: string
  showDetailes: ContentDetailes
  firebase: FirebaseInterface
  uid: string
}

export const handleDatabaseChange =
  ({ id, database, showDetailes, uid, firebase }: HandleDatbaseChange): AppThunk =>
  async (dispatch, getState) => {
    const show = selectShow(getState(), id)

    if (!show) {
      dispatch(handleNewUserShow({ id, database, showDetailes, uid, firebase }))
      return
    }
    if (show.database === database) return

    const updateData = {
      [`allShowsList/${id}/usersWatching`]: firebase.ServerValueIncrement(
        database === "watchingShows" ? 1 : show.database !== "watchingShows" ? 0 : -1
      ),
      [`users/${uid}/content/shows/${id}/database`]: database,
      [`users/${uid}/content/episodes/${id}/info/database`]: database,
      [`users/${uid}/content/episodes/${id}/info/isAllWatched_database`]: `${show.allEpisodesWatched}_${database}`
    }

    try {
      await firebase.database().ref().update(updateData)
    } catch (err) {
      dispatch(setError(err))
    }
  }

export const handleNewUserShow =
  ({ id, database, showDetailes, uid, firebase }: HandleDatbaseChange): AppThunk =>
  async (dispatch) => {
    try {
      const showEpisodesTMDB: any = await getShowEpisodesFromAPI({ id })
      console.log({ showEpisodesTMDB })
      const showsSubDatabase =
        showEpisodesTMDB.status === "Ended" || showEpisodesTMDB.status === "Canceled" ? "ended" : "ongoing"
      const userEpisodes = showEpisodesTMDB.episodes.reduce(
        (acc: {}[], season: { episodes: { air_date: string }[]; season_number: number }) => {
          const episodes = season.episodes.map((episode) => {
            return { watched: false, userRating: 0, air_date: episode.air_date || "" }
          })

          acc.push({ season_number: season.season_number, episodes, userRating: 0 })
          return acc
        },
        []
      )

      const isShowInDatabase = await firebase.showFullData(id).child("id").once("value")
      if (isShowInDatabase.val() === null) {
        await addShowFireDatabase({ firebase, showDetailes, showEpisodesTMDB })
      }

      const updateData = {
        [`users/${uid}/content/shows/${id}`]: {
          allEpisodesWatched: false,
          database: database,
          status: showsSubDatabase,
          firstAirDate: showDetailes.first_air_date,
          name: showDetailes.name,
          timeStamp: firebase.timeStamp(),
          finished: false,
          id
        },
        [`users/${uid}/content/episodes/${id}`]: {
          episodes: userEpisodes,
          info: {
            database: database,
            allEpisodesWatched: false,
            isAllWatched_database: `false_${database}`,
            finished: false
          }
        },
        [`users/${uid}/content/showsLastUpdateList/${id}/lastUpdatedInUser`]: firebase.timeStamp(),
        [`allShowsList/${id}/usersWatching`]: firebase.ServerValueIncrement(database === "watchingShows" ? 1 : 0)
      }

      firebase.database().ref().update(updateData)
    } catch (err) {
      dispatch(setError(err))
    }
  }

export const handleNewShowDatabase =
  ({ id, database, uid, firebase }: HandleDatbaseChange): AppThunk =>
  async (dispatch, getState) => {
    const show = selectShow(getState(), id)

    if (!show) {
    }
  }
