/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-no-undef */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { differenceBtwDatesInDays, isArrayIncludes, releasedEpisodesToOneArray, todayDate } from 'Utils'
import * as _get from 'lodash.get'
import Loader from 'Components/UI/Placeholders/Loader'
import classNames from 'classnames'
import UserRating from 'Components/UI/UserRating/UserRating'
import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import { tmdbTvSeasonURL } from 'Utils/APIUrls'
import useAxiosPromise from 'Utils/Hooks/UseAxiosPromise'
import { useAppSelector } from 'app/hooks'
import { selectShow, selectShowEpisodes } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { SeasonTMDB } from 'Utils/@TypesTMDB'
import useFetchSeasons from './Hooks/UseFetchSeasons/UseFetchSeasons'
import SeasonEpisodes from './SeasonEpisodes'
import isAllEpisodesWatched from './FirebaseHelpers/isAllEpisodesWatched'
import { ShowEpisodesFromAPIInterface } from './@Types'
import './ShowsEpisodes.scss'
import { Link, useLocation } from 'react-router-dom'

type Props = {
  episodesData: SeasonTMDB[]
  showTitle: string
  id: number
  parentComponent: string
  episodesRef: any
}

const ShowEpisodes: React.FC<Props> = ({ episodesData, showTitle, id, parentComponent, episodesRef }) => {
  const { firebase, authUser } = useFrequentVariables()

  const { search } = useLocation()
  const query = useMemo(() => new URLSearchParams(search), [search])

  // const episodesRef = useRef<HTMLDivElement | null>(null)

  console.log({ query: query.get('season') })

  const showInfo = useAppSelector((state) => selectShow(state, id))
  const episodesFromDatabase = useAppSelector((state) => selectShowEpisodes(state, id))
  const releasedEpisodes: SingleEpisodeFromFireDatabase[] = releasedEpisodesToOneArray({ data: episodesFromDatabase })

  const seasons = useMemo(() => episodesData.filter((item) => item.name !== 'Specials'), [episodesData])
  const firstSeason = seasons[seasons.length - Math.min(query.get('season') ?? 1, seasons.length)]

  const [detailEpisodeInfo, setDetailEpisodeInfo] = useState<number[]>([])
  const [errorShowEpisodes] = useState('')

  const { state, handleFetch } = useFetchSeasons<ShowEpisodesFromAPIInterface>({
    disable: parentComponent === 'toWatchPage',
    showId: id,
    preloadSeason: firstSeason,
  })

  const { data: episodesDataFromAPI, loadingData: loadingSeasons, openData: currentlyOpenSeasons, errors } = state

  const showSeasonsEpisodes = (seasonId: number, seasonNum: number) => {
    handleFetch({ seasonNum, seasonId })
  }

  const showEpisodeInfo = (episodeId: number) => {
    if (detailEpisodeInfo.includes(episodeId)) {
      setDetailEpisodeInfo([...detailEpisodeInfo.filter((item) => item !== episodeId)])
    } else {
      setDetailEpisodeInfo([...detailEpisodeInfo, episodeId])
    }
  }

  const toggleWatchedEpisode = (seasonNum: number, episodeNum: number) => {
    if (!authUser?.uid) return
    const toggledEpisode = _get(episodesFromDatabase[seasonNum - 1], ['episodes', episodeNum, 'watched'], null)
    firebase
      .userShowSingleEpisode({
        uid: authUser.uid,
        key: id,
        seasonNum,
        episodeNum,
      })
      .update(
        {
          watched: toggledEpisode !== null ? !toggledEpisode : null,
        },
        () => {
          // if (parentComponent === "toWatchPage") {
          isAllEpisodesWatched({
            showInfo,
            releasedEpisodes,
            episodesFromDatabase,
            authUser,
            firebase,
            isSingleEpisode: true,
          })
          // }
        },
      )
  }

  const checkMultipleEpisodes = (episodesData: { id: number; index: number }[], resetFadeOutEpisodes: () => void) => {
    if (!authUser?.uid) return

    Promise.all(
      episodesData.map((episode: any) =>
        firebase
          .userShowSingleEpisode({
            uid: authUser.uid,
            key: id,
            seasonNum: episode.seasonNum,
            episodeNum: episode.index,
          })
          .update(
            {
              watched: !episodesFromDatabase[episode.seasonNum - 1].episodes[episode.index].watched,
              userRating: episode.rating ? episode.rating : 0,
            },
            () => {},
          ),
      ),
    ).then(() => {
      isAllEpisodesWatched({
        showInfo,
        releasedEpisodes,
        episodesFromDatabase,
        authUser,
        firebase,
        multipleEpisodes: episodesData.length,
      })

      resetFadeOutEpisodes()
    })
  }

  const checkEverySeasonEpisode = (seasonNum: number) => {
    if (!authUser?.uid) return
    const safeGetSeasonEpisodes: SingleEpisodeFromFireDatabase[] = _get(
      episodesFromDatabase[seasonNum - 1],
      'episodes',
      [],
    )

    const seasonEpisodes = safeGetSeasonEpisodes.reduce((acc: SingleEpisodeFromFireDatabase[], episode, index) => {
      if (!releasedEpisodes.find((item) => item.id === episode.id)) return acc
      acc.push({
        userRating: episode.userRating,
        watched: episode.watched,
        air_date: episode.air_date,
        index,
      })
      return acc
    }, [])
    const notWatchedEpisodes = seasonEpisodes.filter((episode) => !episode.watched)
    const updateData: any = {}
    if (notWatchedEpisodes.length) {
      notWatchedEpisodes.forEach((episode) => {
        updateData[`${seasonNum - 1}/episodes/${episode.index}/watched`] = true
      })
      firebase.userShowAllEpisodes(authUser.uid, id).update(updateData)
    } else {
      seasonEpisodes.forEach((episode) => {
        updateData[`${seasonNum - 1}/episodes/${episode.index}/watched`] = false
      })
      firebase.userShowAllEpisodes(authUser.uid, id).update(updateData)
    }

    // const seasonEpisodesFromDatabase = releasedEpisodes.filter((item) => item.season_number === seasonNum)

    // let isAllEpisodesChecked = true

    // seasonEpisodesFromDatabase.forEach((episode: any) => {
    //   if (!seasonEpisodes[episode.index].watched) {
    //     isAllEpisodesChecked = false
    //   }
    // })

    // seasonEpisodesFromDatabase.forEach((episode: any) => {
    //   seasonEpisodes[episode.index].watched = !isAllEpisodesChecked
    // })

    // firebase
    //   .userShowSeasonEpisodes({
    //     uid: authUser.uid,
    //     key: id,
    //     seasonNum
    //   })
    //   .set(seasonEpisodes, () => {
    //     if (parentComponent === "toWatchPage") {
    //       isAllEpisodesWatched({
    //         showInfo,
    //         releasedEpisodes: releasedEpisodes.filter((item) => !item.watched),
    //         episodesFromDatabase,
    //         authUser,
    //         firebase
    //       })
    //     }
    //   })
  }

  const checkEveryShowEpisode = () => {
    if (!authUser?.uid) return

    let isAllEpisodesChecked = true
    let userEpisodesFormated: SingleEpisodeFromFireDatabase[] = []

    episodesFromDatabase.forEach((season: any) => {
      const episodes = season.episodes.filter((item: any) => item.air_date !== '')

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

  const showCheckboxes = showInfo?.database !== 'notWatchingShows'

  // const curOpen = parentComponent === 'toWatchPage' ? currentlyOpen : currentlyOpenSeasons
  const curOpen = currentlyOpenSeasons

  console.log({ errors })

  return (
    <>
      {showCheckboxes && parentComponent === 'detailesPage' && _get(releasedEpisodes, 'length', 0) ? (
        <div className="episodes__check-all-episodes">
          <button type="button" className="button" onClick={() => checkEveryShowEpisode()}>
            Check all episodes
          </button>
        </div>
      ) : (
        ''
      )}
      <div ref={episodesRef} className="episodes">
        {episodesData.map((season) => {
          if (season.season_number === 0 || season.name === 'Specials' || season.episode_count === 0 || !season.id) {
            return null
          }

          const seasonEpisodesNotWatched: any =
            parentComponent === 'toWatchPage' && season.episodes.filter((episode) => !episode.watched)

          const daysToNewSeason = differenceBtwDatesInDays(season.air_date, todayDate)
          const episodeToString: string =
            parentComponent === 'toWatchPage' &&
            _get(seasonEpisodesNotWatched[seasonEpisodesNotWatched.length - 1], 'episode_number', 1).toString()
          const episodeNumber =
            episodeToString.length === 1 ? 'e0'.concat(episodeToString) : 'e'.concat(episodeToString)

          return (
            <div
              key={season.id}
              className={classNames('episodes__episode-group', {
                'episodes__episode-group--no-poster': !season.poster_path && parentComponent === 'detailesPage',
              })}
              style={!loadingSeasons.includes(season.id) ? { rowGap: '10px' } : { rowGap: '0px' }}
            >
              <Link
                to={`/show/${id}/?season=${season.season_number}`}
                id={`season-${season.season_number}`}
                className={classNames('episodes__episode-group-info', {
                  'episodes__episode-group-info--open': currentlyOpenSeasons.includes(season.id),
                  'episodes__episode-group-info--error': isArrayIncludes(season.id, errors),
                  'episodes__episode-group-info--not-aired': daysToNewSeason > 0,
                })}
                onClick={() => showSeasonsEpisodes(season.id, season.season_number)}
              >
                <div className="episodes__episode-group-name">Season {season.season_number}</div>
                {isArrayIncludes(season.id, errors) ? (
                  <div className="episodes__episode-group-days-to-air">Weird error occured wow</div>
                ) : (
                  daysToNewSeason > 0 && (
                    <div className="episodes__episode-group-days-to-air">{daysToNewSeason} days to air</div>
                  )
                )}

                {/* {parentComponent === 'toWatchPage' && (
                  <div className="episodes__episode-group-episodes-left">
                    {seasonEpisodesNotWatched.length} episodes left
                    <span>
                      from
                      {episodeNumber}
                    </span>
                  </div>
                )} */}

                <div className="episodes__episode-group-date">{season.air_date && season.air_date.slice(0, 4)}</div>
              </Link>

              {parentComponent === 'detailesPage' &&
                (!loadingSeasons.includes(season.id) ? (
                  curOpen.includes(season.id) && (
                    <>
                      {season.poster_path && parentComponent === 'detailesPage' && (
                        <div className="episodes__episode-group-poster-wrapper">
                          {showInfo?.database && daysToNewSeason <= 0 && (
                            <UserRating
                              id={id}
                              firebaseRef="userShowSeason"
                              seasonNum={season.season_number}
                              disableRating={!!(showInfo?.database === 'notWatchingShows')}
                            />
                          )}

                          <div
                            className="episodes__episode-group-poster"
                            style={{
                              backgroundImage: `url(https://image.tmdb.org/t/p/w500/${season.poster_path})`,
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
                ) : (
                  <Loader className="loader--small-pink" />
                ))}

              {/* {parentComponent === 'toWatchPage' &&
                curOpen.includes(season.id) &&
                (!loadingSeasons.includes(season.id) ? (
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
                    {parentComponent === 'toWatchPage' && (
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
                ))} */}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default ShowEpisodes
