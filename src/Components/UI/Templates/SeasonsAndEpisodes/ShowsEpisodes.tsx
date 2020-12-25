import React, { useContext, useEffect, useState } from "react"
import axios from "axios"
import { differenceBtwDatesInDays, todayDate } from "Utils"
import * as _get from "lodash.get"
import isAllEpisodesWatched from "./FirebaseHelpers/isAllEpisodesWatched"
import Loader from "Components/UI/Placeholders/Loader"
import classNames from "classnames"
import UserRating from "Components/UI/UserRating/UserRating"
import {
  SeasonEpisodesFromDatabaseInterface,
  SingleEpisodeInterface
} from "Components/UserContent/UseUserShows/UseUserShows"
import { ShowInfoInterface } from "Components/Pages/Detailes/Detailes"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"
import SeasonEpisodes from "./SeasonEpisodes"
import "./ShowsEpisodes.scss"

const { CancelToken } = require("axios")

let cancelRequest: any

type Props = {
  showDatabaseOnClient?: string | null
  episodesData: EpisodesDataInterface[]
  showTitle: string
  showInfo: ShowInfoInterface
  id: number
  episodesFromDatabase: SeasonEpisodesFromDatabaseInterface[]
  releasedEpisodes: SingleEpisodeInterface[]
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

export interface ShowEpisodesFromAPIInterface {
  seasonId: number
  id?: number
  episodes: SingleEpisodeInterface[]
}

const ShowsEpisodes: React.FC<Props> = ({
  showDatabaseOnClient,
  episodesData,
  showTitle,
  showInfo,
  id,
  episodesFromDatabase,
  releasedEpisodes,
  parentComponent
}) => {
  const seasons = episodesData.filter((item) => item.name !== "Specials")

  const [loadingEpisodesIds, setLoadingEpisodesIds] = useState<number[]>([])
  const [currentlyOpenSeasons, setCurrentlyOpenSeasons] = useState<number[]>([seasons[seasons?.length - 1]?.id])
  const [episodesDataFromAPI, setEpisodesDataFromAPI] = useState<ShowEpisodesFromAPIInterface[]>([])
  const [detailEpisodeInfo, setDetailEpisodeInfo] = useState<number[]>([])
  const [errorShowEpisodes, setErrorShowEpisodes] = useState("")

  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)

  useEffect(() => {
    const initialFirstSeasonLoad = () => {
      if (seasons.length === 0) return

      const firstSeason = seasons[seasons.length - 1]

      if (parentComponent === "toWatchPage") {
        setEpisodesDataFromAPI([{ seasonId: firstSeason.id, episodes: firstSeason.episodes }])
      } else {
        if (loadingEpisodesIds.includes(firstSeason.id)) return
        setLoadingEpisodesIds([...loadingEpisodesIds, firstSeason.id])
        axios
          .get(
            `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&append_to_response=season/${firstSeason.season_number}`,
            {
              cancelToken: new CancelToken(function executor(c: any) {
                cancelRequest = c
              })
            }
          )
          .then(({ data }) => {
            const episodesReverse = data[`season/${firstSeason.season_number}`].episodes.reverse()

            setEpisodesDataFromAPI([{ seasonId: firstSeason.id, episodes: episodesReverse }])
            setLoadingEpisodesIds(loadingEpisodesIds.filter((item) => item !== firstSeason.id))
          })
          .catch((err) => {
            if (axios.isCancel(err)) return
            setLoadingEpisodesIds([])
            setErrorShowEpisodes("Something went wrong, sorry")
          })
      }
    }
    initialFirstSeasonLoad()

    return () => {
      if (cancelRequest !== undefined) cancelRequest()
    }
    // eslint-disable-next-line
  }, [])

  const showSeasonsEpisodes = (seasonId: number, seasonNum: number) => {
    if (currentlyOpenSeasons.includes(seasonId)) {
      setCurrentlyOpenSeasons([...currentlyOpenSeasons.filter((item) => item !== seasonId)])
    } else {
      setCurrentlyOpenSeasons([...currentlyOpenSeasons, seasonId])
    }

    if (parentComponent === "toWatchPage") return
    if (episodesDataFromAPI.some((item) => item.seasonId === seasonId)) return
    if (loadingEpisodesIds.includes(seasonId)) return

    setLoadingEpisodesIds([...loadingEpisodesIds, seasonId])

    axios
      .get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&append_to_response=season/${seasonNum}`,
        {
          cancelToken: new CancelToken(function executor(c: any) {
            cancelRequest = c
          })
        }
      )
      .then(({ data }) => {
        const episodesReverse = data[`season/${seasonNum}`].episodes.reverse()
        setEpisodesDataFromAPI((prevState) => [...prevState, { seasonId, episodes: episodesReverse }])
        setLoadingEpisodesIds((prevState) => [...prevState.filter((item) => item !== seasonId)])
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        setLoadingEpisodesIds([])
        setErrorShowEpisodes("Something went wrong, sorry")
      })
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

  const showCheckboxes = showInfo.showInUserDatabase && showDatabaseOnClient !== "notWatchingShows"
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
                "episodes__episode-group--no-poster": !season.poster_path
              })}
              style={!loadingEpisodesIds.includes(season.id) ? { rowGap: "10px" } : { rowGap: "0px" }}
            >
              <div
                className={classNames("episodes__episode-group-info", {
                  "episodes__episode-group-info--open": currentlyOpenSeasons.includes(season.id)
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

              {currentlyOpenSeasons.includes(season.id) &&
                (!loadingEpisodesIds.includes(season.id) ? (
                  <>
                    {season.poster_path && parentComponent === "detailesPage" && (
                      <div className="episodes__episode-group-poster-wrapper">
                        {showInfo.showInUserDatabase && daysToNewSeason <= 0 && (
                          <UserRating
                            id={id}
                            firebaseRef="userShowSeason"
                            seasonNum={season.season_number}
                            disableRating={!!(showDatabaseOnClient === "notWatchingShows")}
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
                      showDatabaseOnClient={showDatabaseOnClient}
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
                  <div>{errorShowEpisodes}</div>
                ))}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default ShowsEpisodes
