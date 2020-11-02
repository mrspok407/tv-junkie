import * as _isFunction from "lodash.isfunction"

const addShowToMainDatabase = ({ firebase, show, dataFromAPI, callback }) => {
  firebase.showInDatabase(show.id).transaction(
    (snapshot) => {
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
    (error, committed, snapshot) => {
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
