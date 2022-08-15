import { useAppDispatch, useAppSelector } from 'app/hooks'
import { ShowFullDataStoreState, SingleEpisodeStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectShow, selectShowEpisodes } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import React, { useState, useEffect, Children, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  releasedEpisodesToOneArray,
  episodesToOneArray,
} from 'Components/UserContent/UseUserShowsRed/Utils/episodesOneArrayModifiers'
import { getSeasonEpisodes, getSeasons } from '../Helpers'
import ToWatchEpisode from './ToWatchEpisode'
import ToWatchSeason from './ToWatchSeason'

type Props = {
  // showData: ShowFullDataStoreState
  showId: number
}

const ToWatchShow: React.FC<Props> = ({ showId }) => {
  const userShow = useAppSelector((state) => selectShow(state, showId))!
  const dispatch = useAppDispatch()

  if (userShow?.allReleasedEpisodesWatched || userShow?.allReleasedEpisodesWatched === null) {
    return null
  }
  // const seasons = useAppSelector((state) => selectShowEpisodes(state, showData.id).length)

  const seasons = dispatch(getSeasons({ showId }))

  // const seasons = useAppSelector((state) => {
  //   const episodes = selectShowEpisodes(state, showData.id)?.filter((season) => {
  //     return season.episodes.some((episode) => !episode.watched)
  //   })
  //   return episodes
  // })
  // console.log({ isAnyEpisodeNotWatched })
  // if (!isAnyEpisodeNotWatched) {
  //   return null
  // }
  // console.log('ToWatchShow rerender')

  return (
    <div className="towatch__show">
      <Link className="towatch__show-name" to={`/show/${showId}`}>
        {userShow.name}
      </Link>
      <div className="episodes">
        {seasons?.map((season) => {
          // const episodes = dispatch(getSeasonEpisodes({ showId: showData.id, seasonNumber: season.season_number }))

          return (
            <ToWatchSeason showData={userShow} seasonData={season} key={season.season_number}>
              {/* {episodes?.map((episode) => {
                return <ToWatchEpisode key={episode.id} showId={showData.id} episodeData={episode} />
              })} */}
            </ToWatchSeason>
          )
        })}
      </div>
    </div>
  )
}

export default ToWatchShow
