import React, { useCallback, useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import ShowsEpisodes from "Components/UI/Templates/SeasonsAndEpisodes/ShowsEpisodes"
import { todayDate, combineMergeObjects, releasedEpisodesToOneArray } from "Utils"
import Loader from "Components/UI/Placeholders/Loader"
import PlaceholderNoToWatchEpisodes from "Components/UI/Placeholders/PlaceholderNoToWatchEpisodes"
import merge from "deepmerge"
import { AppContext } from "Components/AppContext/AppContextHOC"
import {
  SeasonEpisodesFromDatabaseInterface,
  SingleEpisodeInterface,
  UserToWatchShowsInterface
} from "Components/UserContent/UseUserShows"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"

const ToWatchEpisodesContent: React.FC = () => {
  const [watchingShows, setWatchingShows] = useState<UserToWatchShowsInterface[]>([])
  const [initialLoading, setInitialLoading] = useState(true)

  const context = useContext(AppContext)

  const getContent = useCallback(() => {
    const watchingShows = context.userContent.userShows.filter(
      (show) => show.database === "watchingShows" && !show.allEpisodesWatched
    )
    const toWatchEpisodes = context.userContent.userToWatchShows

    const watchingShowsModified = watchingShows.reduce((acc: ContentDetailes[], show) => {
      if (toWatchEpisodes.find((item) => item.id === show.id)) {
        acc.push(show)
      }
      return acc
    }, [])

    if (toWatchEpisodes.length === 0) {
      setWatchingShows([])
      if (!context.userContent.loadingNotFinishedShows && !context.userContent.loadingShows) {
        setInitialLoading(false)
      }
      return
    }

    const mergedShows = merge(watchingShowsModified, toWatchEpisodes, {
      arrayMerge: combineMergeObjects
    }).sort((a, b) => (a.first_air_date > b.first_air_date ? -1 : 1))

    setWatchingShows(mergedShows)
    setInitialLoading(false)
  }, [context.userContent])

  useEffect(() => {
    getContent()
  }, [getContent])

  return (
    <div className="content-results content-results--to-watch-page">
      {initialLoading || context.userContent.loadingShowsMerging ? (
        <Loader className="loader--pink" />
      ) : watchingShows.length === 0 ? (
        <PlaceholderNoToWatchEpisodes />
      ) : (
        <>
          {watchingShows.map((show) => {
            const toWatchEpisodes = show.episodes.reduce(
              (acc: SeasonEpisodesFromDatabaseInterface[], season) => {
                const seasonEpisodes = season.episodes.reduce((acc: SingleEpisodeInterface[], episode) => {
                  if (episode.air_date && new Date(episode.air_date).getTime() < todayDate.getTime()) {
                    acc.push(episode)
                  }
                  return acc
                }, [])

                seasonEpisodes.reverse()

                if (seasonEpisodes.length !== 0 && seasonEpisodes.some((item) => !item.watched)) {
                  acc.push({ ...season, episodes: seasonEpisodes })
                }

                return acc
              },
              []
            )
            toWatchEpisodes.reverse()

            const releasedEpisodes = releasedEpisodesToOneArray({ data: toWatchEpisodes })
            return (
              <div key={show.id} className="towatch__show">
                <Link className="towatch__show-name" to={`/show/${show.id}`}>
                  {show.name}
                </Link>
                <ShowsEpisodes
                  toWatchPage={true}
                  seasonsArr={toWatchEpisodes}
                  showTitle={show.name || show.original_name}
                  id={show.id}
                  showInfo={show}
                  episodesFromDatabase={show.episodes}
                  releasedEpisodes={releasedEpisodes}
                />
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default ToWatchEpisodesContent

// class ToWatchEpisodesContent extends Component {
//   constructor(props) {
//     super(props)

//     this.state = {
//       watchingShows: [],
//       initialLoading: true
//     }
//   }

//   componentDidMount() {
//     this.prevContext = this.context
//     this.getContent()
//   }

//   componentDidUpdate() {
//     if (this.prevContext.userContent !== this.context.userContent) {
//       this.getContent()
//     }
//     this.prevContext = this.context
//   }

//   getContent = () => {
//     const watchingShows = this.context.userContent.userShows.filter(
//       (show) => show.database === "watchingShows" && !show.allEpisodesWatched
//     )
//     const toWatchEpisodes = this.context.userContent.userToWatchShows

//     const watchingShowsModified = watchingShows.reduce((acc, show) => {
//       if (toWatchEpisodes.find((item) => item.id === show.id)) {
//         acc.push(show)
//       }
//       return acc
//     }, [])

//     if (toWatchEpisodes.length === 0) {
//       this.setState({ watchingShows: [] })

//       if (!this.context.userContent.loadingNotFinishedShows && !this.context.userContent.loadingShows) {
//         this.setState({ initialLoading: false })
//       }
//       return
//     }

//     const mergedShows = merge(watchingShowsModified, toWatchEpisodes, {
//       arrayMerge: combineMergeObjects
//     }).sort((a, b) => (a.first_air_date > b.first_air_date ? -1 : 1))

//     this.setState({ watchingShows: mergedShows, initialLoading: false })
//   }

//   showEpisodeInfo = (episodeId) => {
//     if (this.state.detailEpisodeInfo.includes(episodeId)) {
//       this.setState((prevState) => ({
//         detailEpisodeInfo: [...prevState.detailEpisodeInfo.filter((item) => item !== episodeId)]
//       }))
//     } else {
//       this.setState((prevState) => ({
//         detailEpisodeInfo: [...prevState.detailEpisodeInfo, episodeId]
//       }))
//     }
//   }

//   render() {
//     return (
//       <div className="content-results content-results--to-watch-page">
//         {this.state.initialLoading || this.context.userContent.loadingShowsMerging ? (
//           <Loader className="loader--pink" />
//         ) : this.state.watchingShows.length === 0 ? (
//           <PlaceholderNoToWatchEpisodes />
//         ) : (
//           <>
//             {this.state.watchingShows.map((show) => {
//               const toWatchEpisodes = show.episodes.reduce((acc, season) => {
//                 const seasonEpisodes = season.episodes.reduce((acc, episode) => {
//                   if (episode.air_date && new Date(episode.air_date) < todayDate.getTime()) {
//                     acc.push(episode)
//                   }
//                   return acc
//                 }, [])

//                 seasonEpisodes.reverse()

//                 if (seasonEpisodes.length !== 0 && seasonEpisodes.some((item) => !item.watched)) {
//                   acc.push({ ...season, episodes: seasonEpisodes })
//                 }

//                 return acc
//               }, [])
//               toWatchEpisodes.reverse()

//               const releasedEpisodes = releasedEpisodesToOneArray({ data: toWatchEpisodes })
//               return (
//                 <div key={show.id} className="towatch__show">
//                   <Link className="towatch__show-name" to={`/show/${show.id}`}>
//                     {show.name}
//                   </Link>
//                   <ShowsEpisodes
//                     toWatchPage={true}
//                     seasonsArr={toWatchEpisodes}
//                     showTitle={show.name || show.original_name}
//                     id={show.id}
//                     showInfo={show}
//                     episodesFromDatabase={show.episodes}
//                     releasedEpisodes={releasedEpisodes}
//                   />
//                 </div>
//               )
//             })}
//           </>
//         )}
//       </div>
//     )
//   }
// }

// export default ToWatchEpisodesContent
// ToWatchEpisodesContent.contextType = AppContext
