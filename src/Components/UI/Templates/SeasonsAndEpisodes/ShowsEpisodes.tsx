import React, { useContext, useEffect, useState } from "react"
import axios from "axios"
import { differenceBtwDatesInDays, todayDate } from "Utils"
import * as _get from "lodash.get"
import isAllEpisodesWatched from "./FirebaseHelpers/isAllEpisodesWatched"
import Loader from "Components/UI/Placeholders/Loader"
import classNames from "classnames"
import SeasonEpisodes from "./SeasonEpisodes"
import UserRating from "Components/UI/UserRating/UserRating"
import {
  SeasonEpisodesFromDatabaseInterface,
  SingleEpisodeInterface
} from "Components/UserContent/UseUserShows/UseUserShows"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"
import { FirebaseContext } from "Components/Firebase"
import "./ShowsEpisodes.scss"

const { CancelToken } = require("axios")

let cancelRequest: any

type Props = {
  detailesPage?: boolean
  toWatchPage?: boolean
  showDatabaseOnClient?: string | null
  seasonsArr: SeasonEpisodesFromDatabaseInterface[]
  showTitle: string
  showInfo?: { status?: string; id?: number; database?: string } | null
  id: number
  episodesFromDatabase: SeasonEpisodesFromDatabaseInterface[]
  releasedEpisodes: SingleEpisodeInterface[]
}

interface ShowEpisodesInterface {
  seasonId: number
  episodes: SingleEpisodeInterface[]
}

const ShowsEpisodes: React.FC<Props> = ({
  detailesPage,
  toWatchPage,
  showDatabaseOnClient,
  seasonsArr,
  showTitle,
  showInfo,
  id,
  episodesFromDatabase,
  releasedEpisodes
}) => {
  const [loadingEpisodesIds, setLoadingEpisodesIds] = useState<number[]>([])
  const [openSeasons, setOpenSeasons] = useState<number[]>([])
  const [showEpisodes, setShowEpisodes] = useState<ShowEpisodesInterface[]>([])
  const [detailEpisodeInfo, setDetailEpisodeInfo] = useState<number[]>([])
  const [errorShowEpisodes, setErrorShowEpisodes] = useState("")

  const firebase = useContext(FirebaseContext)
  const authUser = useAuthUser()

  useEffect(() => {
    const initialFirstSeasonLoad = () => {
      const seasons = seasonsArr.filter((item) => item.name !== "Specials")
      if (seasons.length === 0) return

      const firstSeason = seasons[seasons.length - 1]

      if (firstSeason.id) setOpenSeasons([firstSeason.id])

      if (toWatchPage) {
        setShowEpisodes([{ seasonId: firstSeason.id, episodes: firstSeason.episodes }])
      } else {
        axios
          .get(
            `https://api.themoviedb.org/3/tv/${id}/season/${firstSeason.season_number}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`,
            {
              cancelToken: new CancelToken(function executor(c: any) {
                cancelRequest = c
              })
            }
          )
          .then(({ data: { episodes } }) => {
            const episodesReverse = episodes.reverse()

            setShowEpisodes([{ seasonId: firstSeason.id, episodes: episodesReverse }])
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
    if (openSeasons.includes(seasonId)) {
      setOpenSeasons([...openSeasons.filter((item) => item !== seasonId)])
    } else {
      setOpenSeasons([...openSeasons, seasonId])
    }

    if (toWatchPage) return
    if (showEpisodes.some((item) => item.seasonId === seasonId)) return

    setLoadingEpisodesIds([...loadingEpisodesIds, seasonId])

    axios
      .get(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonNum}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`,
        {
          cancelToken: new CancelToken(function executor(c: any) {
            cancelRequest = c
          })
        }
      )
      .then(({ data: { episodes } }) => {
        const episodesReverse = episodes.reverse()
        setShowEpisodes((prevState) => [...prevState, { seasonId, episodes: episodesReverse }])
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

    firebase
      .userShowSingleEpisode({
        uid: authUser.uid,
        key: id,
        seasonNum,
        episodeNum
      })
      .update(
        {
          watched: !episodesFromDatabase[seasonNum - 1].episodes[episodeNum].watched
        },
        () => {
          if (toWatchPage) {
            isAllEpisodesWatched({
              showInfo,
              releasedEpisodes,
              authUser: authUser,
              firebase: firebase,
              singleEpisode: true
            })
          }
        }
      )
  }

  const checkEverySeasonEpisode = (seasonNum: number) => {
    if (!authUser) return

    const seasonEpisodes = episodesFromDatabase[seasonNum - 1].episodes.reduce(
      (acc: SingleEpisodeInterface[], episode) => {
        acc.push({ userRating: episode.userRating, watched: episode.watched, air_date: episode.air_date })
        return acc
      },
      []
    )
    const seasonEpisodesAirDate = episodesFromDatabase[seasonNum - 1].episodes.reduce(
      (acc: SingleEpisodeInterface[], episode) => {
        acc.push({
          userRating: episode.userRating,
          watched: episode.watched,
          air_date: episode.air_date || null
        })
        return acc
      },
      []
    )

    const seasonEpisodesFromDatabase = releasedEpisodes.filter((item) => item.season_number === seasonNum)
    const seasonLength = seasonEpisodesFromDatabase.length

    let isAllEpisodesChecked = true

    seasonEpisodesFromDatabase.forEach((episode, episodeIndex) => {
      const indexOfEpisode = seasonLength - 1 - episodeIndex
      if (!seasonEpisodes[indexOfEpisode].watched) {
        isAllEpisodesChecked = false
      }
    })

    seasonEpisodesFromDatabase.forEach((episode, episodeIndex) => {
      const indexOfEpisode = seasonLength - 1 - episodeIndex
      seasonEpisodes[indexOfEpisode].watched = !isAllEpisodesChecked
      seasonEpisodesAirDate[indexOfEpisode].watched = !isAllEpisodesChecked
    })

    firebase
      .userShowSeasonEpisodes({
        uid: authUser.uid,
        key: id,
        seasonNum
      })
      .set(seasonEpisodes, () => {
        if (toWatchPage) {
          isAllEpisodesWatched({
            showInfo,
            releasedEpisodes,
            authUser: authUser,
            firebase: firebase,
            singleEpisode: false
          })
        }
      })
  }

  const checkEveryShowEpisode = () => {
    if (!authUser) return

    let isAllEpisodesChecked = true
    let userEpisodesFormated: SingleEpisodeInterface[] = []

    episodesFromDatabase.forEach((season) => {
      const episodes = season.episodes

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

  const showCheckboxes = showInfo && showDatabaseOnClient !== "notWatchingShows"
  console.log(showInfo)
  return (
    <>
      {showCheckboxes && detailesPage && _get(releasedEpisodes, "length", 0) ? (
        <div className="episodes__check-all-episodes">
          <button type="button" className="button" onClick={() => checkEveryShowEpisode()}>
            Check all episodes
          </button>
        </div>
      ) : (
        ""
      )}
      <div className="episodes">
        {seasonsArr.map((season) => {
          if (season.season_number === 0 || season.name === "Specials" || season.episode_count === 0) {
            return null
          }

          const seasonEpisodesNotWatched: any =
            toWatchPage && season.episodes.filter((episode) => !episode.watched)

          const daysToNewSeason = differenceBtwDatesInDays(season.air_date, todayDate)

          const episodeToString =
            toWatchPage &&
            seasonEpisodesNotWatched[seasonEpisodesNotWatched.length - 1].episode_number.toString()
          const episodeNumber =
            episodeToString && episodeToString.length === 1
              ? "e0".concat(episodeToString)
              : "e".concat(episodeToString)

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
                  "episodes__episode-group-info--open": openSeasons.includes(season.id)
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

                {toWatchPage && (
                  <div className="episodes__episode-group-episodes-left">
                    {seasonEpisodesNotWatched.length} episodes left <span>from {episodeNumber}</span>
                  </div>
                )}

                <div className="episodes__episode-group-date">
                  {season.air_date && season.air_date.slice(0, 4)}
                </div>
              </div>

              {openSeasons.includes(season.id) &&
                (!loadingEpisodesIds.includes(season.id) ? (
                  <>
                    {season.poster_path && detailesPage && (
                      <div className="episodes__episode-group-poster-wrapper">
                        {showInfo && daysToNewSeason <= 0 && (
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
                      detailesPage={detailesPage}
                      seasonsArr={seasonsArr}
                      showEpisodes={showEpisodes}
                      toWatchPage={toWatchPage}
                      showTitle={showTitle}
                      detailEpisodeInfo={detailEpisodeInfo}
                      season={season}
                      seasonId={season.id}
                      authUser={authUser}
                      episodesFromDatabase={episodesFromDatabase}
                      showInfo={showInfo}
                      showDatabaseOnClient={showDatabaseOnClient}
                      showEpisodeInfo={showEpisodeInfo}
                      toggleWatchedEpisode={toggleWatchedEpisode}
                    />
                    {toWatchPage && (
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
