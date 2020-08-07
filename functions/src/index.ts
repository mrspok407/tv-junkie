import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
// import axios from "axios"

admin.initializeApp()

const database = admin.database()
// const config = functions.config()

export const testScheduleFunction = functions.pubsub
  .schedule("* * * * *")
  .timeZone("UTC") // Users can choose timezone - default is America/Los_Angeles
  .onRun(context => {
    database
      .ref("allShowsList/ongoing")
      .update({ test: "timeFunctionWorking" })
      .catch(err => {
        console.log(err)
      })
    console.log("This will be run every minute")
    return
  })

// export const onAddShow = functions.database
//   .ref("users/{uid}/content/watchingShows/{showUid}")
//   .onCreate((snapshot, context) => {
//     // const userUid = context.params.uid
//     // const showUid = context.params.showUid
//     const showId = snapshot.val().id
//     // let episodes = "test"
//     return axios
//       .get(`https://api.themoviedb.org/3/tv/${showId}?api_key=${config.api.tmdb}&language=en-US`)
//       .then(({ data: { number_of_seasons } }) => {
//         const maxSeasonsInChunk = 20
//         const allSeasons = []
//         const seasonChunks = []
//         const apiRequests: Promise<import("axios").AxiosResponse<any>>[] = []

//         for (let i = 1; i <= number_of_seasons; i += 1) {
//           allSeasons.push(`season/${i}`)
//         }

//         for (let i = 0; i <= allSeasons.length; i += maxSeasonsInChunk) {
//           const chunk = allSeasons.slice(i, i + maxSeasonsInChunk)
//           seasonChunks.push(chunk.join())
//         }

//         seasonChunks.forEach(item => {
//           const request = axios.get(
//             `https://api.themoviedb.org/3/tv/${showId}?api_key=${config.api.tmdb}&append_to_response=${item}`
//           )
//           apiRequests.push(request)
//         })

//         return axios.all([...apiRequests])
//       })
//       .then(
//         axios.spread((...responses) => {
//           const rowData: any[] = []
//           const seasonsData: { [x: string]: any }[] = []

//           responses.forEach(item => {
//             rowData.push(item.data)
//           })

//           const mergedRowData = Object.assign({}, ...rowData)

//           Object.entries(mergedRowData).forEach(([key, value]) => {
//             if (!key.indexOf("season/")) {
//               const newKey = key.replace("/", "")
//               seasonsData.push({ [newKey]: { ...(value as {}) } })
//             }
//           })

//           console.log(seasonsData)
//           return snapshot.ref.update({ episodes: seasonsData })
//         })
//       )
//       .catch(err => {
//         console.log(err)
//       })
//   })
