/* eslint-disable array-callback-return */
import React, { useContext, useEffect, useReducer, useRef, useState } from "react"
import { differenceBtwDatesInDays, todayDate } from "Utils"
import classNames from "classnames"
import * as _get from "lodash.get"
import { Link } from "react-router-dom"
import * as ROUTES from "Utils/Constants/routes"
import UserRating from "Components/UI/UserRating/UserRating"
import TorrentLinksEpisodes from "./Components/TorrentLinksEpisodes"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { SeasonEpisodesFromDatabaseInterface } from "Components/UserContent/UseUserShows/UseUserShows"
import { EpisodesDataInterface, ShowEpisodesFromAPIInterface } from "./ShowsEpisodes"
import { ShowInfoInterface } from "Components/Pages/Detailes/Detailes"

const FADE_OUT_SPEED = 300

type Props = {
  parentComponent: string
  episodesData: EpisodesDataInterface[]
  episodesDataFromAPI: ShowEpisodesFromAPIInterface[]
  showTitle: string
  detailEpisodeInfo: number[]
  season: EpisodesDataInterface
  seasonId: number
  episodesFromDatabase: SeasonEpisodesFromDatabaseInterface[]
  showInfo: ShowInfoInterface
  showDatabaseOnClient: string | null | undefined
  showEpisodeInfo: (episodeId: number) => void
  toggleWatchedEpisode: (
    seasonNum: number,
    episodeNum: number,
    index?: number,
    arrLength?: number,
    callback?: any
  ) => any
  checkBunchOfEpisodes: any
}

const reducer: any = (state: any, action: any) => {
  const { fadeOutEpisodes } = state
  if (action.type === "fadeOut") {
    return {
      ...state,
      fadeOutEpisodes: [...fadeOutEpisodes, action.payload]
    }
  } else if (action.type === "reset") {
    return {
      ...state,
      fadeOutEpisodes: []
    }
  } else if (action.type === "function") {
    state.fadeOutEpisodes.forEach((item: any) => {
      action.fun(action.season_number, item.index)
    })
    return state
  }
}

const SeasonEpisodes: React.FC<Props> = ({
  parentComponent,
  episodesData,
  episodesDataFromAPI,
  showTitle,
  detailEpisodeInfo,
  season,
  seasonId,
  episodesFromDatabase,
  showInfo,
  showDatabaseOnClient,
  showEpisodeInfo,
  toggleWatchedEpisode,
  checkBunchOfEpisodes
}) => {
  const [fadeOutEpisodes, setFadeOutEpisodes] = useState<{ id: number; index: number }[]>([])
  const [disableCheckboxWarning, setDisableCheckboxWarning] = useState<number | null>(null)

  const { authUser } = useContext(AppContext)

  const episodeRef = useRef<HTMLDivElement>(null)
  const checkboxRef = useRef<HTMLDivElement>(null)
  const registerWarningRef = useRef<HTMLDivElement>(null)
  const episodeFadeOutTimeout = useRef<number | null>()

  // const [state, dispatch]: [any, any] = useReducer(reducer, { fadeOutEpisodes: [] })

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
    // eslint-disable-next-line
  }, [])

  const handleClickOutside = (e: CustomEvent) => {
    if (authUser) return
    if (
      checkboxRef.current &&
      registerWarningRef.current &&
      !checkboxRef.current.contains(e.target as Node) &&
      !registerWarningRef.current.contains(e.target as Node)
    ) {
      setDisableCheckboxWarning(null)
    }
  }

  const showDissableCheckboxWarning = (checkboxId: number) => {
    if (authUser) return
    setDisableCheckboxWarning(checkboxId)
  }

  // const fadeOutRef: any = useRef([])
  const [timedOut, setTimedOut] = useState(false)

  const reset = () => {
    console.log("reset")
    setFadeOutEpisodes([])
  }

  useEffect(() => {
    console.log("useEffect run Before")
    if (!timedOut || fadeOutEpisodes.length === 0) return
    console.log("useEffect run")
    checkBunchOfEpisodes(fadeOutEpisodes, reset)
    // fadeOutEpisodes.forEach((item: any, index, array) => {
    //   toggleWatchedEpisode(season.season_number, item.index, index, array.length, reset)
    // })
    // setFadeOutEpisodes([])
  }, [timedOut, fadeOutEpisodes])

  const handleFadeOut = (episodeId: number, episodeIndex: number, seasonNum: any, rating?: any) => {
    // if (fadeOutRef.current.find((item: any) => item.id === episodeId)) return
    if (fadeOutEpisodes.find((item: any) => item.id === episodeId)) return
    window.clearTimeout(episodeFadeOutTimeout.current || 0)
    setTimedOut(false)

    // dispatch({ type: "fadeOut", payload: { id: episodeId, index: episodeIndex } })
    // fadeOutRef.current = [...fadeOutRef.current, { id: episodeId, index: episodeIndex }]

    setFadeOutEpisodes((prevState) => [
      ...prevState,
      { id: episodeId, index: episodeIndex, seasonNum, rating }
    ])
    // season.season_number, item.index
    episodeFadeOutTimeout.current = window.setTimeout(() => {
      setTimedOut(true)
      // console.log({ fadeOutEpisodes: state.fadeOutEpisodes })
      // console.log({ fadeOutRef_Inside: fadeOutRef.current })
      // dispatch({ type: "function", fun: toggleWatchedEpisode, season_number: season.season_number })
      // dispatch({ type: "reset" })
      // fadeOutRef.current.forEach((item: any) => {
      //   toggleWatchedEpisode(season.season_number, item.index)
      // })
      // fadeOutRef.current = []
    }, FADE_OUT_SPEED)
  }

  const showCheckboxes =
    showInfo.database &&
    showDatabaseOnClient !== "notWatchingShows" &&
    episodesFromDatabase &&
    episodesFromDatabase.length > 0 &&
    true

  const showSeason = showCheckboxes && episodesFromDatabase[season.season_number - 1]
  const seasons = parentComponent === "toWatchPage" ? episodesData : episodesDataFromAPI

  return (
    <div className="episodes__episode-list">
      {(seasons as Array<EpisodesDataInterface | ShowEpisodesFromAPIInterface>).map((item) => {
        const correctSeasonId = parentComponent === "toWatchPage" ? item.id : item.seasonId

        if (correctSeasonId !== seasonId) return null

        return item.episodes.map((episode, episodeIndex) => {
          if (parentComponent === "toWatchPage" && episode.watched) return
          const indexOfEpisode = item.episodes.length - 1 - episodeIndex

          // Format Date //
          const airDateISO = episode.air_date && new Date(episode.air_date).toISOString()

          const options = {
            month: "long",
            day: "numeric",
            year: "numeric"
          }

          const formatedDate = new Date(airDateISO as string)

          const episodeAirDate = episode.air_date
            ? new Intl.DateTimeFormat("en-US", options).format(formatedDate as Date)
            : "No date available"
          // Format Date End //

          const episodeAirDateAsDateObj = episode.air_date && new Date(episode.air_date)

          const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)

          return (
            <div
              ref={episodeRef}
              key={episode.id}
              className={classNames("episodes__episode", {
                "episodes__episode--open": detailEpisodeInfo.includes(episode.id as number),
                "fade-out-episode":
                  parentComponent === "toWatchPage" &&
                  fadeOutEpisodes.find((item: any) => item.id === episode.id)
              })}
            >
              <div
                className="episodes__episode-wrapper"
                onClick={() => parentComponent === "detailesPage" && showEpisodeInfo(episode.id as number)}
                style={
                  daysToNewEpisode > 0 || !episode.air_date
                    ? {
                        backgroundColor: "rgba(132, 90, 90, 0.3)"
                      }
                    : {
                        backgroundColor: "#1d1d1d96"
                      }
                }
              >
                {parentComponent === "toWatchPage" && (
                  <UserRating
                    id={showInfo.id}
                    firebaseRef="userShowSingleEpisode"
                    seasonNum={season.season_number}
                    episodeNum={indexOfEpisode}
                    episodeId={episode.id}
                    handleFadeOut={handleFadeOut}
                    parentComponent={parentComponent}
                  />
                )}
                <div className="episodes__episode-date">{episodeAirDate}</div>
                <div className="episodes__episode-name">
                  <span className="episodes__episode-number">{episode.episode_number}.</span>
                  {episode.name}
                </div>
                {daysToNewEpisode > 0 ? (
                  <div className="episodes__episode-days-to-air">
                    {daysToNewEpisode === 1 ? `${daysToNewEpisode} day` : `${daysToNewEpisode} days`}
                  </div>
                ) : (
                  episodeAirDateAsDateObj &&
                  episodeAirDateAsDateObj.getTime() < todayDate.getTime() &&
                  episode.air_date &&
                  parentComponent === "toWatchPage" && (
                    <TorrentLinksEpisodes
                      parentComponent={parentComponent}
                      showTitle={showTitle}
                      seasonNumber={season.season_number}
                      episodeNumber={episode.episode_number as number}
                    />
                  )
                )}
              </div>

              {daysToNewEpisode <= 0 && episode.air_date && (
                <div
                  ref={checkboxRef}
                  className="episodes__episode-checkbox"
                  onClick={() => showDissableCheckboxWarning(episode.id as number)}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={_get(showSeason, `episodes.${indexOfEpisode}.watched`, false)}
                      onChange={() => {
                        if (parentComponent === "toWatchPage") {
                          handleFadeOut(
                            episode.id as number,
                            indexOfEpisode,
                            season.season_number,
                            episode.userRating
                          )
                        } else {
                          toggleWatchedEpisode(season.season_number, indexOfEpisode)
                        }
                      }}
                      disabled={!showCheckboxes || !authUser}
                    />
                    <span
                      className={classNames("custom-checkmark", {
                        "custom-checkmark--disabled": !showCheckboxes || !authUser
                      })}
                    />
                  </label>
                  {disableCheckboxWarning === episode.id && (
                    <div ref={registerWarningRef} className="buttons__col-warning">
                      To use full features please{" "}
                      <Link className="buttons__col-link" to={ROUTES.LOGIN_PAGE}>
                        register
                      </Link>
                      . Your allready selected shows will be saved.
                    </div>
                  )}
                </div>
              )}

              {detailEpisodeInfo.includes(episode.id as number) && (
                <div
                  className={classNames("episodes__episode-detailes", {
                    "episodes__episode-detailes--no-image": !episode.still_path
                  })}
                >
                  {episode.still_path && (
                    <div
                      className="episodes__episode-detailes-image"
                      style={{
                        backgroundImage: `url(https://image.tmdb.org/t/p/w500${episode.still_path})`
                      }}
                    />
                  )}
                  {episode.overview && (
                    <div className="episodes__episode-detailes-overview">{episode.overview}</div>
                  )}

                  {episodeAirDateAsDateObj &&
                    episodeAirDateAsDateObj.getTime() < todayDate.getTime() &&
                    episode.air_date && (
                      <>
                        {showInfo.showInUserDatabase && !!episodesFromDatabase && (
                          <UserRating
                            id={showInfo.id}
                            firebaseRef="userShowSingleEpisode"
                            seasonNum={season.season_number}
                            episodeNum={indexOfEpisode}
                            episodeRating={true}
                            disableRating={!!(showDatabaseOnClient === "notWatchingShows")}
                          />
                        )}
                        <TorrentLinksEpisodes
                          showTitle={showTitle}
                          seasonNumber={season.season_number}
                          episodeNumber={episode.episode_number as number}
                        />
                      </>
                    )}
                </div>
              )}
            </div>
          )
        })
      })}
    </div>
  )
}

export default SeasonEpisodes

// export default class SeasonEpisodes extends Component {
//   constructor(props) {
//     super(props)

//     this.state = {
//       fadeOutEpisodes: [],
//       disableCheckboxWarning: null,
//       checkbox: ""
//     }

//     this.episode = React.createRef()
//     this.checkboxRef = React.createRef()
//     this.registerWarningRef = React.createRef()

//     this.episodeFadeOutTimeout = null
//   }

//   componentDidMount() {
//     document.addEventListener("mousedown", this.handleClickOutside)
//   }

//   componentWillUnmount() {
//     document.removeEventListener("mousedown", this.handleClickOutside)
//   }

//   handleClickOutside = (e) => {
//     if (this.context.authUser) return
//     if (
//       this.checkboxRef.current &&
//       this.registerWarningRef.current &&
//       !this.checkboxRef.current.contains(e.target) &&
//       !this.registerWarningRef.current.contains(e.target)
//     ) {
//       this.setState({
//         disableCheckboxWarning: null
//       })
//     }
//   }

//   showDissableCheckboxWarning = (checkboxId) => {
//     if (this.context.authUser) return
//     this.setState({
//       disableCheckboxWarning: checkboxId
//     })
//   }

//   handleFadeOut = (episodeId, episodeIndex) => {
//     if (this.state.fadeOutEpisodes.find((item) => item.id === episodeId)) return

//     clearTimeout(this.episodeFadeOutTimeout)

//     this.setState({
//       fadeOutEpisodes: [...this.state.fadeOutEpisodes, { id: episodeId, index: episodeIndex }]
//     })

//     this.episodeFadeOutTimeout = setTimeout(() => {
//       const fadeOutEpisodes = this.state.fadeOutEpisodes
//       this.setState({
//         fadeOutEpisodes: []
//       })

//       fadeOutEpisodes.forEach((item) => {
//         this.props.toggleWatchedEpisode(this.props.season.season_number, item.index)
//       })
//     }, FADE_OUT_SPEED)
//   }

//   render() {
//     const showCheckboxes =
//       this.props.showInfo &&
//       this.props.showDatabaseOnClient !== "notWatchingShows" &&
//       this.props.episodesFromDatabase &&
//       this.props.episodesFromDatabase.length > 0 &&
//       true

//     const showSeason = showCheckboxes && this.props.episodesFromDatabase[this.props.season.season_number - 1]

//     const seasons = this.props.toWatchPage ? this.props.seasonsArr : this.props.showEpisodes

//     return (
//       <div className="episodes__episode-list">
//         {seasons.map((item) => {
//           const seasonId = this.props.toWatchPage ? item.id : item.seasonId

//           if (seasonId !== this.props.seasonId) return null

//           return item.episodes.map((episode, episodeIndex) => {
//             if (this.props.toWatchPage && episode.watched) return
//             const indexOfEpisode = item.episodes.length - 1 - episodeIndex

//             // Format Date //
//             const airDateISO = episode.air_date && new Date(episode.air_date).toISOString()

//             const optionss = {
//               month: "long",
//               day: "numeric",
//               year: "numeric"
//             }

//             const formatedDate = new Date(airDateISO)

//             const episodeAirDate = episode.air_date
//               ? new Intl.DateTimeFormat("en-US", optionss).format(formatedDate)
//               : "No date available"
//             // Format Date End //

//             const episodeAirDateAsDateObj = new Date(episode.air_date)

//             const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)

//             return (
//               <div
//                 ref={this.episode}
//                 key={episode.id}
//                 className={classNames("episodes__episode", {
//                   "episodes__episode--open": this.props.detailEpisodeInfo.includes(episode.id),
//                   "fade-out-episode":
//                     this.props.toWatchPage &&
//                     this.state.fadeOutEpisodes.find((item) => item.id === episode.id)
//                 })}
//               >
//                 <div
//                   className="episodes__episode-wrapper"
//                   onClick={() => this.props.detailesPage && this.props.showEpisodeInfo(episode.id)}
//                   style={
//                     daysToNewEpisode > 0 || !episode.air_date
//                       ? {
//                           backgroundColor: "rgba(132, 90, 90, 0.3)"
//                         }
//                       : {
//                           backgroundColor: "#1d1d1d96"
//                         }
//                   }
//                 >
//                   {this.props.toWatchPage && (
//                     <UserRating
//                       id={this.props.showInfo.id}
//                       firebaseRef="userShowSingleEpisode"
//                       seasonNum={this.props.season.season_number}
//                       episodeNum={indexOfEpisode}
//                       episodeId={episode.id}
//                       handleFadeOut={this.handleFadeOut}
//                       toWatchPage={this.props.toWatchPage}
//                     />
//                   )}
//                   <div className="episodes__episode-date">{episodeAirDate}</div>
//                   <div className="episodes__episode-name">
//                     <span className="episodes__episode-number">{episode.episode_number}.</span>
//                     {episode.name}
//                   </div>
//                   {daysToNewEpisode > 0 ? (
//                     <div className="episodes__episode-days-to-air">
//                       {daysToNewEpisode === 1 ? `${daysToNewEpisode} day` : `${daysToNewEpisode} days`}
//                     </div>
//                   ) : (
//                     episodeAirDateAsDateObj < todayDate.getTime() &&
//                     episode.air_date &&
//                     this.props.toWatchPage && (
//                       <TorrentLinksEpisodes
//                         toWatchPage={true}
//                         showTitle={this.props.showTitle}
//                         seasonNumber={this.props.season.season_number}
//                         episodeNumber={episode.episode_number}
//                       />
//                     )
//                   )}
//                 </div>

//                 {daysToNewEpisode <= 0 && episode.air_date && (
//                   <div
//                     ref={this.checkboxRef}
//                     className="episodes__episode-checkbox"
//                     onClick={() => this.showDissableCheckboxWarning(episode.id)}
//                   >
//                     <label>
//                       <input
//                         type="checkbox"
//                         checked={_get(showSeason, `episodes.${indexOfEpisode}.watched`, false)}
//                         onChange={() => {
//                           if (this.props.toWatchPage) {
//                             this.handleFadeOut(episode.id, indexOfEpisode)
//                           } else {
//                             this.props.toggleWatchedEpisode(this.props.season.season_number, indexOfEpisode)
//                           }
//                         }}
//                         disabled={!showCheckboxes || !this.context.authUser}
//                       />
//                       <span
//                         className={classNames("custom-checkmark", {
//                           "custom-checkmark--disabled": !showCheckboxes || !this.context.authUser
//                         })}
//                       />
//                     </label>
//                     {this.state.disableCheckboxWarning === episode.id && (
//                       <div ref={this.registerWarningRef} className="buttons__col-warning">
//                         To use full features please{" "}
//                         <Link className="buttons__col-link" to={ROUTES.LOGIN_PAGE}>
//                           register
//                         </Link>
//                         . Your allready selected shows will be saved.
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {this.props.detailEpisodeInfo.includes(episode.id) && (
//                   <div
//                     className={classNames("episodes__episode-detailes", {
//                       "episodes__episode-detailes--no-image": !episode.still_path
//                     })}
//                   >
//                     {episode.still_path && (
//                       <div
//                         className="episodes__episode-detailes-image"
//                         style={{
//                           backgroundImage: `url(https://image.tmdb.org/t/p/w500${episode.still_path})`
//                         }}
//                       />
//                     )}
//                     {episode.overview && (
//                       <div className="episodes__episode-detailes-overview">{episode.overview}</div>
//                     )}

//                     {episodeAirDateAsDateObj < todayDate.getTime() && episode.air_date && (
//                       <>
//                         {this.props.showInfo.showInUserDatabase && !!this.props.episodesFromDatabase && (
//                           <UserRating
//                             id={this.props.showInfo.id}
//                             firebaseRef="userShowSingleEpisode"
//                             seasonNum={this.props.season.season_number}
//                             episodeNum={indexOfEpisode}
//                             episodeRating={true}
//                             disableRating={!!(this.props.showDatabaseOnClient === "notWatchingShows")}
//                           />
//                         )}
//                         <TorrentLinksEpisodes
//                           showTitle={this.props.showTitle}
//                           seasonNumber={this.props.season.season_number}
//                           episodeNumber={episode.episode_number}
//                         />
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )
//           })
//         })}
//       </div>
//     )
//   }
// }

// SeasonEpisodes.contextType = AppContext
