/* eslint-disable no-nested-ternary */
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ShowEpisodes from 'Components/UI/Templates/SeasonsAndEpisodes/ShowEpisodes'
import { currentDate, combineMergeObjects } from 'Utils'
import Loader from 'Components/UI/Placeholders/Loader'
import PlaceholderNoToWatchEpisodes from 'Components/UI/Placeholders/PlaceholderNoToWatchEpisodes'
import merge from 'deepmerge'
import { EpisodesFromFireDatabase, SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import { EpisodesStoreState, ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { releasedEpisodesToOneArray } from 'Components/UserContent/UseUserShowsRed/Utils/episodesOneArrayModifiers'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import {
  selectEpisodes,
  selectShow,
  selectShowEpisodes,
  selectShows,
  selectShowsIds,
  selectShowsLoading,
} from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import useAppSelectorArray from 'Utils/Hooks/UseAppSelectorArray'
import ToWatchShow from './Components/ToWatchShow'
import ToWatchEpisode from './Components/ToWatchEpisode'
import { getSeasonEpisodes, getSeasons } from './Helpers'
import ToWatchSeason from './Components/ToWatchSeason'

const ToWatchEpisodesContent: React.FC = () => {
  const showsInitialLoading = useAppSelector(selectShowsLoading)

  const userShowsIds = useAppSelector(selectShowsIds)
  const userShowsIdsReverse = useMemo(() => {
    return [...userShowsIds].reverse()
  }, [userShowsIds])

  const test = useAppSelector((state) => {
    const idsNotAllWatched = userShowsIds.filter((id) => {
      const showStore = selectShow(state, id)
      console.log({ isAllReleasedEpisodesWatched: showStore })
      return showStore?.allReleasedEpisodesWatched === false && showStore.database === 'watchingShows'
    })
    return !!idsNotAllWatched.length
  })

  console.log({ test })

  // const userShowsIds = useAppSelector((state) => {
  //   const ids = selectShowsIds(state)
  // const idsNotAllWatched = ids.filter((id) => {
  //   const isAllReleasedEpisodesWatched = selectShow(state, id)?.allReleasedEpisodesWatched
  //   return !isAllReleasedEpisodesWatched
  // })
  //   return idsNotAllWatched
  // })
  // const userShowsToWatch = useMemo(() => {
  //   return userShows.filter((show) => show.database === 'watchingShows' && !show.allEpisodesWatched)
  // }, [userShows])

  // const dispatch = useAppDispatch()

  // const seasonsLength = useAppSelector((state) => {
  //   return selectShowEpisodes(state, showData.id)?.length
  // })
  // const [test, setTest] = useState(0)

  // useEffect(() => {
  //   setTimeout(() => {
  //     setTest((prev) => prev + 1)
  //   }, 3000)
  // }, [])

  console.log({ userShowsIds })
  if (showsInitialLoading) {
    return (
      <div className="content-results content-results--calendar">
        <Loader className="loader--pink" />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="content-results content-results--calendar">
        <PlaceholderNoToWatchEpisodes />
      </div>
    )
  }

  return (
    <div className="content-results content-results--to-watch-page">
      {userShowsIdsReverse.map((showId) => {
        return <ToWatchShow key={showId} showId={showId} />
      })}
    </div>
  )
}

export default ToWatchEpisodesContent
