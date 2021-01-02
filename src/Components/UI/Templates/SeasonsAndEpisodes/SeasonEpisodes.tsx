/* eslint-disable array-callback-return */
import React, { useContext, useEffect, useRef, useState } from "react"
import { differenceBtwDatesInDays, todayDate } from "Utils"
import { Link } from "react-router-dom"
import classNames from "classnames"
import * as _get from "lodash.get"
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
  checkMultipleEpisodes: (episodesData: { id: number; index: number }[], resetFadeOutEpisodes: () => void) => void
}

export interface HandleFadeOutInterface {
  episodeId: number
  episodeIndex: number
  seasonNum: number
  rating?: number
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
  checkMultipleEpisodes
}) => {
  const [fadeOutEpisodes, setFadeOutEpisodes] = useState<{ id: number; index: number }[]>([])
  const [disableCheckboxWarning, setDisableCheckboxWarning] = useState<number | null>(null)

  const { authUser } = useContext(AppContext)

  const episodeRef = useRef<HTMLDivElement>(null)
  const checkboxRef = useRef<HTMLDivElement>(null)
  const registerWarningRef = useRef<HTMLDivElement>(null)
  const episodeFadeOutTimeout = useRef<number | null>()
  const [timedOut, setTimedOut] = useState(false)

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

  const resetFadeOutEpisodes = () => {
    setFadeOutEpisodes([])
  }

  useEffect(() => {
    if (!timedOut || fadeOutEpisodes.length === 0) return
    checkMultipleEpisodes(fadeOutEpisodes, resetFadeOutEpisodes)
    // eslint-disable-next-line
  }, [timedOut, fadeOutEpisodes])

  const handleFadeOut = ({ episodeId, episodeIndex, seasonNum, rating }: HandleFadeOutInterface) => {
    if (fadeOutEpisodes.find((item: any) => item.id === episodeId)) return
    window.clearTimeout(episodeFadeOutTimeout.current || 0)
    setTimedOut(false)

    setFadeOutEpisodes((prevState) => [...prevState, { id: episodeId, index: episodeIndex, seasonNum, rating }])

    episodeFadeOutTimeout.current = window.setTimeout(() => {
      setTimedOut(true)
    }, FADE_OUT_SPEED)
  }

  const showCheckboxes =
    showInfo.database && showDatabaseOnClient !== "notWatchingShows" && episodesFromDatabase?.length > 0 && true

  const showSeason = showCheckboxes && episodesFromDatabase[season.season_number - 1]
  const seasons = parentComponent === "toWatchPage" ? episodesData : episodesDataFromAPI

  return (
    <div className="episodes__episode-list">
      {(seasons as Array<EpisodesDataInterface | ShowEpisodesFromAPIInterface>).map((item) => {
        const correctSeasonId = parentComponent === "toWatchPage" ? item.id : item.seasonId

        if (correctSeasonId !== seasonId) return null

        return item.episodes.map((episode, episodeIndex) => {
          if (parentComponent === "toWatchPage" && episode.watched) return
          const indexOfEpisode: any =
            parentComponent === "toWatchPage" ? episode.index : item.episodes.length - 1 - episodeIndex

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
                  parentComponent === "toWatchPage" && fadeOutEpisodes.find((item: any) => item.id === episode.id)
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
                  {_get(episode, "name", "-")}
                </div>
                {daysToNewEpisode > 0 ? (
                  <div className="episodes__episode-days-to-air">
                    {daysToNewEpisode === 1 ? `${daysToNewEpisode} day` : `${daysToNewEpisode} days`}
                  </div>
                ) : (
                  episodeAirDateAsDateObj &&
                  episodeAirDateAsDateObj.getTime() < todayDate.getTime() &&
                  episode.air_date &&
                  parentComponent === "toWatchPage" &&
                  authUser?.email === process.env.REACT_APP_ADMIN_EMAIL && (
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
                          handleFadeOut({
                            episodeId: _get(episode, "id") as number,
                            episodeIndex: indexOfEpisode,
                            seasonNum: season.season_number,
                            rating: episode.userRating
                          })
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
                  {episode.overview && <div className="episodes__episode-detailes-overview">{episode.overview}</div>}

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
                        {authUser?.email === process.env.REACT_APP_ADMIN_EMAIL && (
                          <TorrentLinksEpisodes
                            showTitle={showTitle}
                            seasonNumber={season.season_number}
                            episodeNumber={episode.episode_number as number}
                          />
                        )}
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
