import { useAppDispatch, useAppSelector } from 'app/hooks'
import { ShowFullDataStoreState, SingleEpisodeStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectShowEpisodes } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import React, { useState, useEffect, Children, useMemo } from 'react'
import { Link } from 'react-router-dom'
import releasedEpisodesToOneArray, { episodesToOneArray } from 'Utils/episodesToOneArray'
import { getSeasonEpisodes, getSeasons } from '../Helpers'
import ToWatchEpisode from './ToWatchEpisode'
import ToWatchSeason from './ToWatchSeason'

type Props = {
  showData: ShowFullDataStoreState
}

const ToWatchShow: React.FC<Props> = ({ showData }) => {
  const dispatch = useAppDispatch()
  // const seasons = useAppSelector((state) => selectShowEpisodes(state, showData.id).length)

  const seasons = dispatch(getSeasons({ showId: showData.id }))

  const isAnyEpisodeNotWatched = useAppSelector((state) => {
    const episodes = selectShowEpisodes(state, showData.id)
    return releasedEpisodesToOneArray<SingleEpisodeStoreState>(episodes).some((episode) => !episode.watched)
  })
  console.log({ isAnyEpisodeNotWatched })
  if (!isAnyEpisodeNotWatched) {
    return null
  }
  console.log('ToWatchShow rerender')

  return (
    <div className="towatch__show">
      <Link className="towatch__show-name" to={`/show/${showData.id}`}>
        {showData.name}
      </Link>
      <div className="episodes">
        {seasons?.map((season) => {
          const episodes = dispatch(getSeasonEpisodes({ showId: showData.id, seasonNumber: season.season_number }))

          return (
            <ToWatchSeason showData={showData} seasonData={season} key={season.season_number}>
              {episodes?.map((episode) => {
                return <ToWatchEpisode key={episode.id} showId={showData.id} episodeData={episode} />
              })}
            </ToWatchSeason>
          )
        })}
      </div>
    </div>
  )
}

export default ToWatchShow
