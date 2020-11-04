import * as _isFunction from "lodash.isfunction"

interface Arguments {
  firebase: {
    showInDatabase: any
  }
  show: {
    id: number
    backdrop_path: string
    first_air_date: string
    genre_ids: number[]
    name: string
    original_name: string
    overview: string
    poster_path: string
    vote_average: string | number
    vote_count: string | number
  }
  dataFromAPI: { status: string; episodes: {}[] }
  callback?: any
}

const addShowToMainDatabase = ({ firebase, show, dataFromAPI, callback }: Arguments) => {
  firebase.showInDatabase(show.id).transaction(
    (snapshot: any) => {
      if (snapshot === null) {
        return {
          info: {
            backdrop_path: show.backdrop_path,
            first_air_date: show.first_air_date,
            genre_ids: show.genre_ids,
            id: show.id,
            name: show.name,
            original_name: show.original_name,
            overview: show.overview,
            poster_path: show.poster_path,
            vote_average: show.vote_average,
            vote_count: show.vote_count,
            status: dataFromAPI.status
          },
          episodes: dataFromAPI.episodes,
          id: show.id.toString(),
          usersWatching: 1
        }
      } else {
        return
      }
    },
    (error: any, committed: any, snapshot: any) => {
      if (error) {
        console.log("Transaction failed abnormally!", error)
      } else if (!committed) {
        console.log("We aborted the transaction (because allready exists).")
        firebase.showInDatabase(show.id).update({
          usersWatching: snapshot.val().usersWatching + 1
        })

        if (_isFunction(callback)) callback({ status: dataFromAPI.status })
      } else {
        if (_isFunction(callback)) callback({ status: dataFromAPI.status })
        console.log("added!")
      }
    }
  )
}

export default addShowToMainDatabase
