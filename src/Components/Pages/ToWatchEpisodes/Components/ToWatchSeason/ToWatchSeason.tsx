import React, { useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import classNames from 'classnames'
import { EpisodesStoreState, ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { differenceInCalendarDays, format } from 'date-fns'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { postCheckReleasedEpisodes } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/PostData/postShowEpisodesData'
import { currentDate } from 'Utils'
import { isValid } from 'date-fns'
import ToWatchEpisode from '../ToWatchEpisode/ToWatchEpisode'
import { getSeasonEpisodes } from '../../Helpers'
import EpisodesLeft from './Components/EpisodesLeft'
import useShouldToWatchSeasonRender from './Hooks/UseShouldToWatchSeasonRender'

type Props = {
  seasonData: EpisodesStoreState
  showData: ShowFullDataStoreState
  initialOpenSeasonNumber: number
  seasonsListRef: React.MutableRefObject<HTMLDivElement>
  showsListRef: React.MutableRefObject<HTMLDivElement>
  isCheckEpisodeAnimationRunning: React.MutableRefObject<boolean>
  showIndex: number
}

const ToWatchSeason: React.FC<Props> = ({
  showData,
  seasonData,
  initialOpenSeasonNumber,
  seasonsListRef,
  showsListRef,
  isCheckEpisodeAnimationRunning,
  showIndex,
}) => {
  const { firebase } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const checkAllButtonRef = useRef<HTMLDivElement>(null!)
  const episodesListRef = useRef<HTMLDivElement>(null!)

  const [isEpisodesOpen, setIsEpisodesOpen] = useState(seasonData.season_number === initialOpenSeasonNumber)

  const seasonEpisodes = dispatch(
    getSeasonEpisodes({ showId: showData.id, seasonNumber: seasonData.originalSeasonIndex }),
  )

  const seasonReleaseDate = new Date(seasonData?.air_date ?? '')
  const seasonYearRelease = isValid(seasonReleaseDate) ? format(seasonReleaseDate, 'yyyy') : 'No date available'

  const shouldSeasonRender = useShouldToWatchSeasonRender({ seasonData, showData })
  if (!shouldSeasonRender) {
    return null
  }

  return (
    <div className="episodes__episode-group" data-seasonnumber={seasonData.season_number} data-id={seasonData.id}>
      <div
        onClick={() => setIsEpisodesOpen(!isEpisodesOpen)}
        className={classNames('episodes__episode-group-info', {
          'episodes__episode-group-info--open': isEpisodesOpen,
        })}
      >
        <div className="episodes__episode-group-name">Season {seasonData.season_number}</div>
        <EpisodesLeft showId={showData.id} seasonData={seasonData} />
        <div
          className={classNames('episodes__episode-group-date', {
            'episodes__episode-group-date--no-date': seasonYearRelease === 'No date available',
          })}
        >
          {seasonYearRelease}
        </div>
      </div>

      {isEpisodesOpen && (
        <>
          <div ref={episodesListRef} className="episodes__episode-list">
            {seasonEpisodes?.map((episode) => {
              return (
                <ToWatchEpisode
                  key={episode.id}
                  showId={showData.id}
                  episodeData={episode}
                  showsListRef={showsListRef}
                  seasonsListRef={seasonsListRef}
                  episodesListRef={episodesListRef}
                  isCheckEpisodeAnimationRunning={isCheckEpisodeAnimationRunning}
                  showIndex={showIndex}
                  checkAllButtonRef={checkAllButtonRef}
                />
              )
            })}
          </div>

          <div ref={checkAllButtonRef} className="episodes__episode-group-check-all-episodes">
            <button
              type="button"
              className="button"
              onClick={() => {
                dispatch(
                  postCheckReleasedEpisodes({
                    showId: showData.id,
                    seasonNumber: seasonData.originalSeasonIndex,
                    firebase,
                  }),
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
