import React, { useContext, useEffect, useState } from "react"
import { differenceBtwDatesInDays, releasedEpisodesToOneArray, todayDate } from "Utils"
import * as _get from "lodash.get"
import isAllEpisodesWatched from "./FirebaseHelpers/isAllEpisodesWatched"
import Loader from "Components/UI/Placeholders/Loader"
import classNames from "classnames"
import UserRating from "Components/UI/UserRating/UserRating"
import {
  SeasonEpisodesFromDatabaseInterface,
  SingleEpisodeInterface
} from "Components/UserContent/UseUserShows/UseUserShows"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"
import SeasonEpisodes from "./SeasonEpisodes"
import useFetchSeasons from "./Hooks/UseFetchSeasons/UseFetchSeasons"
import { tmdbTvSeasonURL } from "Utils/APIUrls"
import useAxiosPromise from "Utils/Hooks/UseAxiosPromise"
import "./ShowsEpisodes.scss"
import { useAppSelector } from "app/hooks"
import { selectShow, selectShowEpisodes } from "Components/UserContent/UseUserShowsRed/userShowsSliceRed"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"

type Props = {
  showDatabaseOnClient?: string | null
  episodesData: EpisodesDataInterface[]
  showTitle: string
  showInfo?: ContentDetailes
  id: number
  episodesFromDatabase?: SeasonEpisodesFromDatabaseInterface[]
  releasedEpisodes?: SingleEpisodeInterface[]
  parentComponent: string
}

export interface EpisodesDataInterface {
  name?: string
  id: number
  seasonId?: number
  air_date?: string
  season_number: number
  episode_count?: number
  poster_path?: string
  episodes: SingleEpisodeInterface[]
}

export interface currentlyOpenSeasons {
  seasonId: number
  seasonNum: number
}

export interface ShowEpisodesFromAPIInterface {
  seasonId: number
  id?: number
  episodes: SingleEpisodeInterface[]
}

const ShowsEpisodes: React.FC<Props> = ({
  episodesData,
  showTitle,
  // showInfo,
  id,
  // episodesFromDatabase,
  // releasedEpisodes,
  parentComponent
}) => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)

  const showInfo = useAppSelector((state) => selectShow(state, id))
  const episodesFromDatabase = useAppSelector((state) => selectShowEpisodes(state, id))
  const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({ data: episodesFromDatabase })

  const seasons = episodesData.filter((item) => item.name !== "Specials")
  const firstSeason = seasons[seasons.length - 1]

  const [currentlyOpen, setCurrentlyOpen] = useState<string[]>(seasons.length ? [firstSeason?.id.toString()] : [])

  const [detailEpisodeInfo, setDetailEpisodeInfo] = useState<number[]>([])
  const [errorShowEpisodes] = useState("")

  console.log({ episodesFromDatabase })
  console.log({ releasedEpisodes })

  const [openSeason, setOpenSeason] = useState({ seasonId: firstSeason?.id, seasonNum: firstSeason?.season_number })

  const promiseData = useAxiosPromise({
    fullRerenderDeps: id,
    content: {
      id: openSeason.seasonId,
      seasonNum: openSeason.seasonNum,
      url: tmdbTvSeasonURL({ showId: id, seasonNum: openSeason?.seasonNum })
    },
    disable: parentComponent === "toWatchPage"
  })

  const { state, dispatch } = useFetchSeasons<ShowEpisodesFromAPIInterface>({
    disable: parentComponent === "toWatchPage",
    promiseData
  })

  const { data: episodesDataFromAPI, loading: loadingSeasons, openData: currentlyOpenSeasons } = state

  const showSeasonsEpisodes = (seasonId: number, seasonNum: number) => {
    if (parentComponent === "toWatchPage") {
      if (currentlyOpen.includes(seasonId.toString())) {
        setCurrentlyOpen([...currentlyOpen.filter((item) => item !== seasonId.toString())])
      } else {
        setCurrentlyOpen([...currentlyOpen, seasonId.toString()])
      }
      return
    }

    if (openSeason.seasonId === seasonId) {
      dispatch({ type: "handleOpenData", payload: { id: seasonId.toString() } })
    } else {
      setOpenSeason({ seasonId, seasonNum })
    }
  }

  const showEpisodeInfo = (episodeId: number) => {
    if (detailEpisodeInfo.includes(episodeId)) {
      setDetailEpisodeInfo([...detailEpisodeInfo.filter((item) => item !== episodeId)])
    } else {
      setDetailEpisodeInfo([...detailEpisodeInfo, episodeId])
    }
  }

  const toggleWatchedEpisode = (seasonNum: number, episodeNum: number) => {
    if (!authUser) return
    const toggledEpisode = _get(episodesFromDatabase[seasonNum - 1], ["episodes", episodeNum, "watched"], null)
    firebase
      .userShowSingleEpisode({
        uid: authUser.uid,
        key: id,
        seasonNum,
        episodeNum
      })
      .update(
        {
          watched: toggledEpisode !== null ? !toggledEpisode : null
        },
        () => {
          if (parentComponent === "toWatchPage") {
            isAllEpisodesWatched({
              showInfo: showInfo,
              releasedEpisodes,
              episodesFromDatabase,
              authUser: authUser,
              firebase: firebase,
              isSingleEpisode: true
            })
          }
        }
      )
  }

  const checkMultipleEpisodes = (episodesData: { id: number; index: number }[], resetFadeOutEpisodes: () => void) => {
    if (!authUser) return

    Promise.all(
      episodesData.map((episode: any) => {
        return firebase
          .userShowSingleEpisode({
            uid: authUser.uid,
            key: id,
            seasonNum: episode.seasonNum,
            episodeNum: episode.index
          })
          .update(
            {
              watched: !episodesFromDatabase[episode.seasonNum - 1].episodes[episode.index].watched,
              userRating: episode.rating ? episode.rating : 0
            },
            () => {}
          )
      })
    ).then(() => {
      isAllEpisodesWatched({
        showInfo: showInfo,
        releasedEpisodes,
        episodesFromDatabase,
        authUser: authUser,
        firebase: firebase,
        multipleEpisodes: episodesData.length
      })

      resetFadeOutEpisodes()
    })
  }

  const checkEverySeasonEpisode = (seasonNum: number) => {
    if (!authUser) return
    const safeGetSeasonEpisodes: SingleEpisodeInterface[] = _get(episodesFromDatabase[seasonNum - 1], "episodes", [])

    const seasonEpisodes = safeGetSeasonEpisodes.reduce((acc: SingleEpisodeInterface[], episode) => {
      acc.push({
        userRating: episode.userRating,
        watched: episode.watched,
        air_date: episode.air_date
      })
      return acc
    }, [])

    const seasonEpisodesFromDatabase = releasedEpisodes.filter((item) => item.season_number === seasonNum)

    let isAllEpisodesChecked = true

    seasonEpisodesFromDatabase.forEach((episode: any) => {
      if (!seasonEpisodes[episode.index].watched) {
        isAllEpisodesChecked = false
      }
    })

    seasonEpisodesFromDatabase.forEach((episode: any) => {
      seasonEpisodes[episode.index].watched = !isAllEpisodesChecked
    })

    firebase
      .userShowSeasonEpisodes({
        uid: authUser.uid,
        key: id,
        seasonNum
      })
      .set(seasonEpisodes, () => {
        if (parentComponent === "toWatchPage") {
          isAllEpisodesWatched({
            showInfo,
            releasedEpisodes: releasedEpisodes.filter((item) => !item.watched),
            episodesFromDatabase,
            authUser,
            firebase
          })
        }
      })
  }

  const checkEveryShowEpisode = () => {
    if (!authUser) return

    let isAllEpisodesChecked = true
    let userEpisodesFormated: SingleEpisodeInterface[] = []

    episodesFromDatabase.forEach((season) => {
      const episodes = season.episodes.filter((item) => item.air_date !== "")

      userEpisodesFormated = [...userEpisodesFormated, ...episodes]
    })

    releasedEpisodes.forEach((episode, episodeIndex) => {
      const indexOfEpisode = releasedEpisodes.length - 1 - episodeIndex
      if (!userEpisodesFormated[indexOfEpisode].watched) {
        isAllEpisodesChecked = false
      }
    })

    releasedEpisodes.forEach((episode, episodeIndex) => {
      userEpisodesFormated[episodeIndex].watched = !isAllEpisodesChecked
    })

    firebase.userShowAllEpisodes(authUser.uid, id).set(episodesFromDatabase)
  }

  const showCheckboxes = showInfo?.database !== "notWatchingShows"

  const curOpen = parentComponent === "toWatchPage" ? currentlyOpen : currentlyOpenSeasons

  return (
    <>
      {showCheckboxes && parentComponent === "detailesPage" && _get(releasedEpisodes, "length", 0) ? (
        <div className="episodes__check-all-episodes">
          <button type="button" className="button" onClick={() => checkEveryShowEpisode()}>
            Check all episodes
          </button>
        </div>
      ) : (
        ""
      )}
      <div className="episodes">
        {episodesData.map((season) => {
          if (season.season_number === 0 || season.name === "Specials" || season.episode_count === 0 || !season.id) {
            return null
          }

          const seasonEpisodesNotWatched: any =
            parentComponent === "toWatchPage" && season.episodes.filter((episode) => !episode.watched)

          const daysToNewSeason = differenceBtwDatesInDays(season.air_date, todayDate)
          const episodeToString: string =
            parentComponent === "toWatchPage" &&
            _get(seasonEpisodesNotWatched[seasonEpisodesNotWatched.length - 1], "episode_number", 1).toString()
          const episodeNumber =
            episodeToString.length === 1 ? "e0".concat(episodeToString) : "e".concat(episodeToString)

          return (
            <div
              key={season.id}
              className={classNames("episodes__episode-group", {
                "episodes__episode-group--no-poster": !season.poster_path && parentComponent === "detailesPage"
              })}
              style={!loadingSeasons.includes(season.id.toString()) ? { rowGap: "10px" } : { rowGap: "0px" }}
            >
              <div
                className={classNames("episodes__episode-group-info", {
                  "episodes__episode-group-info--open": currentlyOpenSeasons.includes(season.id.toString())
                })}
                style={
                  daysToNewSeason > 0
                    ? {
                        backgroundColor: "rgba(132, 90, 90, 0.3)"
                      }
                    : {
                        backgroundColor: "#1d1d1d96"
                      }
                }
                onClick={() => showSeasonsEpisodes(season.id, season.season_number)}
              >
                <div className="episodes__episode-group-name">Season {season.season_number}</div>
                {daysToNewSeason > 0 && (
                  <div className="episodes__episode-group-days-to-air">{daysToNewSeason} days to air</div>
                )}

                {parentComponent === "toWatchPage" && (
                  <div className="episodes__episode-group-episodes-left">
                    {seasonEpisodesNotWatched.length} episodes left <span>from {episodeNumber}</span>
                  </div>
                )}

                <div className="episodes__episode-group-date">{season.air_date && season.air_date.slice(0, 4)}</div>
              </div>

              {parentComponent === "detailesPage" &&
                (!loadingSeasons.includes(season.id.toString()) ? (
                  curOpen.includes(season.id.toString()) && (
                    <>
                      {season.poster_path && parentComponent === "detailesPage" && (
                        <div className="episodes__episode-group-poster-wrapper">
                          {showInfo?.database && daysToNewSeason <= 0 && (
                            <UserRating
                              id={id}
                              firebaseRef="userShowSeason"
                              seasonNum={season.season_number}
                              disableRating={!!(showInfo?.database === "notWatchingShows")}
                            />
                          )}

                          <div
                            className="episodes__episode-group-poster"
                            style={{
                              backgroundImage: `url(https://image.tmdb.org/t/p/w500/${season.poster_path})`
                            }}
                          />
                          {showCheckboxes && daysToNewSeason <= 0 && (
                            <div className="episodes__episode-group-check-all-episodes">
                              <button
                                type="button"
                                className="button"
                                onClick={() => checkEverySeasonEpisode(season.season_number)}
                              >
                                Check all
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <SeasonEpisodes
                        parentComponent={parentComponent}
                        episodesData={episodesData}
                        episodesDataFromAPI={episodesDataFromAPI}
                        showTitle={showTitle}
                        detailEpisodeInfo={detailEpisodeInfo}
                        season={season}
                        seasonId={season.id}
                        episodesFromDatabase={episodesFromDatabase}
                        showInfo={showInfo}
                        showEpisodeInfo={showEpisodeInfo}
                        toggleWatchedEpisode={toggleWatchedEpisode}
                        checkMultipleEpisodes={checkMultipleEpisodes}
                      />
                    </>
                  )
                ) : !errorShowEpisodes ? (
                  <Loader className="loader--small-pink" />
                ) : (
                  <div>{errorShowEpisodes}</div>
                ))}

              {parentComponent === "toWatchPage" &&
                curOpen.includes(season.id.toString()) &&
                (!loadingSeasons.includes(season.id.toString()) ? (
                  <>
                    <SeasonEpisodes
                      parentComponent={parentComponent}
                      episodesData={episodesData}
                      episodesDataFromAPI={episodesDataFromAPI}
                      showTitle={showTitle}
                      detailEpisodeInfo={detailEpisodeInfo}
                      season={season}
                      seasonId={season.id}
                      episodesFromDatabase={episodesFromDatabase}
                      showInfo={showInfo}
                      showEpisodeInfo={showEpisodeInfo}
                      toggleWatchedEpisode={toggleWatchedEpisode}
                      checkMultipleEpisodes={checkMultipleEpisodes}
                    />
                    {parentComponent === "toWatchPage" && (
                      <div className="episodes__episode-group-check-all-episodes">
                        <button
                          type="button"
                          className="button"
                          onClick={() => checkEverySeasonEpisode(season.season_number)}
                        >
                          Check all
                        </button>
                      </div>
                    )}
                  </>
                ) : !errorShowEpisodes ? (
                  <Loader className="loader--small-pink" />
                ) : (
                  // <div>{errorShowEpisodes}</div>
                  <></>
                ))}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default ShowsEpisodes
