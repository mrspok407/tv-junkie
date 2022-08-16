import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import classNames from 'classnames'
import { EpisodesStoreState, ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { format } from 'date-fns'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { postCheckReleasedEpisodes } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/PostData/postShowEpisodesData'
import ToWatchEpisode from '../ToWatchEpisode/ToWatchEpisode'
import { getSeasonEpisodes } from '../../Helpers'
import EpisodesLeft from './Components/EpisodesLeft'

type Props = {
  seasonData: EpisodesStoreState
  showData: ShowFullDataStoreState
  initialOpenSeasonNumber: number
}

const ToWatchSeason: React.FC<Props> = ({ showData, seasonData, initialOpenSeasonNumber }) => {
  const { firebase } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const [isEpisodesOpen, setIsEpisodesOpen] = useState(seasonData.season_number === initialOpenSeasonNumber)

  const isAllReleasedEpisodesWatched = useAppSelector((state) => {
    const season = selectSingleSeason(state, showData.id, seasonData.season_number)
    return season?.allReleasedEpisodesWatched
  })!

  const seasonEpisodes = dispatch(getSeasonEpisodes({ showId: showData.id, seasonNumber: seasonData.season_number }))

  if (isAllReleasedEpisodesWatched) {
    return null
  }

  const seasonYearRelease = format(new Date(seasonData?.air_date ?? ''), 'yyyy')

  return (
    <div className="episodes__episode-group">
      <div
        onClick={() => setIsEpisodesOpen(!isEpisodesOpen)}
        className={classNames('episodes__episode-group-info', {
          'episodes__episode-group-info--open': isEpisodesOpen,
        })}
      >
        <div className="episodes__episode-group-name">Season {seasonData.season_number}</div>
        <EpisodesLeft showId={showData.id} seasonNumber={seasonData.season_number} />
        <div className="episodes__episode-group-date">{seasonYearRelease}</div>
      </div>

      {isEpisodesOpen && (
        <>
          <div className="episodes__episode-list">
            {seasonEpisodes?.map((episode) => {
              return <ToWatchEpisode key={episode.id} showId={showData.id} episodeData={episode} />
            })}
          </div>

          <div className="episodes__episode-group-check-all-episodes">
            <button
              type="button"
              className="button"
              onClick={() => {
                dispatch(
                  postCheckReleasedEpisodes({ showId: showData.id, seasonNumber: seasonData.season_number, firebase }),
                )
              }}
            >
              Check all
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ToWatchSeason
