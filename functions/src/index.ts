import * as functions from "firebase-functions"
import axios from "axios"

const config = functions.config()

export const onAddShow = functions.database
  .ref("users/{uid}/content/watchingShows/{showUid}")
  .onCreate((snapshot, context) => {
    // const userUid = context.params.uid
    // const showUid = context.params.showUid
    const showId = snapshot.val().id
    // let episodes = "test"
    return axios
      .get(`https://api.themoviedb.org/3/tv/${showId}/external_ids?api_key=${config.api.tmdb}&language=en-US`)
      .then(({ data: { imdb_id } }) => {
        return axios.get(`http://api.tvmaze.com/lookup/shows?imdb=${imdb_id}`)
      })
      .then(({ data: { id } }) => {
        return axios.get(`http://api.tvmaze.com/shows/${id}?embed=episodes`)
      })
      .then(({ data: { _embedded } }) => {
        // const jsonData = JSON.parse(JSON.stringify(_embedded.episodes))
        const episodes = _embedded.episodes
        console.log(episodes)
        return snapshot.ref.update({ episodes: episodes })
      })
      .catch(err => {
        console.log(err)
      })
  })
