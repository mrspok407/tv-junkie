import React from 'react'
import { releasedEpisodesToOneArray } from 'Utils'
import * as _get from 'lodash.get'
import classNames from 'classnames'
import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import { useAppSelector } from 'app/hooks'
import { selectShow, selectShowEpisodes } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { SeasonTMDB } from 'Utils/@TypesTMDB'
import useFetchSeasons from './Hooks/UseFetchSeasons/UseFetchSeasons'
import isAllEpisodesWatched from './FirebaseHelpers/isAllEpisodesWatched'
import { ShowEpisodesFromAPIInterface } from './@Types'
import SeasonsGrid from './Components/SeasonsGrid'
import { ActionTypesEnum } from './Hooks/UseFetchSeasons/ReducerConfig/@Types'
import './ShowsEpisodes.scss'

type Props = {
  seasonsTMDB: SeasonTMDB[]
  showId: number
}

const INITIAL_OPEN_SEASON = 1

const ShowEpisodes: React.FC<Props> = ({ seasonsTMDB, showId }) => {
  const { firebase, authUser } = useFrequentVariables()

  const showInfoStore = useAppSelector((state) => selectShow(state, showId))
  const episodesFromDatabase = useAppSelector((state) => selectShowEpisodes(state, showId))
  const releasedEpisodes = releasedEpisodesToOneArray({ data: episodesFromDatabase })

  const initialOpenedSeason = seasonsTMDB[seasonsTMDB.length - INITIAL_OPEN_SEASON]

  const { state, handleFetch, dispatch } = useFetchSeasons<ShowEpisodesFromAPIInterface>({
    showId,
    preloadSeason: initialOpenedSeason,
  })

  const handleOpenSeasonEpisodes = (seasonId: number, seasonNum: number) => {
    handleFetch({ seasonNum, seasonId })
  }

  const handleAllOpenSeasons = () => {
    dispatch({ type: ActionTypesEnum.HandleCloseAll })
  }

  const toggleWatchedEpisode = (seasonNum: number, episodeNum: number) => {
    if (!authUser?.uid) return
    const toggledEpisode = _get(episodesFromDatabase[seasonNum - 1], ['episodes', episodeNum, 'watched'], null)
    firebase
      .userShowSingleEpisode({
        uid: authUser.uid,
        key: showId,
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
            showInfo: showInfoStore,
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
            key: showId,
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
        showInfo: showInfoStore,
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
      firebase.userShowAllEpisodes(authUser.uid, showId).update(updateData)
    } else {
      seasonEpisodes.forEach((episode) => {
        updateData[`${seasonNum - 1}/episodes/${episode.index}/watched`] = false
      })
      firebase.userShowAllEpisodes(authUser.uid, showId).update(updateData)
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

    firebase.userShowAllEpisodes(authUser.uid, showId).set(episodesFromDatabase)
  }

  const showCheckboxes = showInfoStore?.database !== 'notWatchingShows'
  const showCheckAllEpisodes = showCheckboxes && !!releasedEpisodes.length && authUser?.uid
  return (
    <>
      {showCheckAllEpisodes && (
        <>
          <div className="episodes__check-all-episodes">
            <button type="button" className="button" onClick={() => checkEveryShowEpisode()}>
              Check all episodes
            </button>
          </div>
        </>
      )}

      <div
        className={classNames('episodes__close-all-open', {
          'episodes__close-all-open--left': !showCheckAllEpisodes,
        })}
      >
        <button type="button" className="button" onClick={() => handleAllOpenSeasons()}>
          Close all
        </button>
      </div>

      <SeasonsGrid
        showId={showId}
        seasonsTMDB={seasonsTMDB}
        handleOpenSeasonEpisodes={handleOpenSeasonEpisodes}
        gridState={state}
        showCheckboxes={showCheckboxes}
      />
    </>
  )
}

export default ShowEpisodes
