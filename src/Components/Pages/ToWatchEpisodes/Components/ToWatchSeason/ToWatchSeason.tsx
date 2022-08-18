import React, { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import classNames from 'classnames'
import {
  EpisodesStoreState,
  ShowFullDataStoreState,
  SingleEpisodeStoreState,
} from 'Components/UserContent/UseUserShowsRed/@Types'
import { selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { format } from 'date-fns'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { postCheckReleasedEpisodes } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/PostData/postShowEpisodesData'
import { TO_WATCH_ANIMATION_DURATION } from 'Utils/Constants'
import ToWatchEpisode from '../ToWatchEpisode/ToWatchEpisode'
import { getSeasonEpisodes } from '../../Helpers'
import EpisodesLeft from './Components/EpisodesLeft'

type Props = {
  seasonData: EpisodesStoreState
  showData: ShowFullDataStoreState
  initialOpenSeasonNumber: number
  seasonsListRef: React.MutableRefObject<HTMLDivElement>
}

const ToWatchSeason: React.FC<Props> = ({ showData, seasonData, initialOpenSeasonNumber, seasonsListRef }) => {
  const { firebase } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const episodesListRef = useRef<HTMLDivElement>(null!)
  const checkAllButtonRef = useRef<HTMLDivElement>(null!)

  const [isEpisodesOpen, setIsEpisodesOpen] = useState(seasonData.season_number === initialOpenSeasonNumber)

  const isAllReleasedEpisodesWatched = useAppSelector((state) => {
    const season = selectSingleSeason(state, showData.id, seasonData.season_number)
    return season?.allReleasedEpisodesWatched
  })!

  const seasonEpisodes = dispatch(getSeasonEpisodes({ showId: showData.id, seasonNumber: seasonData.season_number }))

  const handleEpisodeCheck = (episodeData: SingleEpisodeStoreState) => {
    const seasonsNodeList = seasonsListRef.current?.getElementsByClassName(
      'episodes__episode-group',
    ) as HTMLCollectionOf<HTMLElement>
    const episodesNodeList = episodesListRef.current?.getElementsByClassName(
      'episodes__episode',
    ) as HTMLCollectionOf<HTMLElement>

    const toWatchShowElement = document.querySelector('.towatch__show') as HTMLElement

    console.log({ toWatchShowElement })

    const episodesArrayList = Array.from(episodesNodeList)
    const seasonsArrayList = Array.from(seasonsNodeList)

    episodesArrayList.forEach((item) => {
      if (Number(item.dataset.episodenumber) === episodeData.episode_number) {
        item.classList.add('episodes__episode--fade-out')
        // item.classList.add('to-watch-translate-up')
      }
      if (Number(item.dataset.episodenumber) < episodeData.episode_number) {
        // item.classList.add('episodes__episode--translate-up')
        // item.style.transform = `translateY(-${51}px)`
        // item.style.animation = `toWatchTranslateUp ${TO_WATCH_ANIMATION_DURATION} forwards`
        item.classList.add('to-watch-translate-up')
      }
    })
    checkAllButtonRef.current.classList.add('to-watch-translate-up')

    seasonsArrayList.forEach((item) => {
      if (Number(item.dataset.seasonnumber) < episodeData.season_number) {
        // item.classList.add('episodes__episode-group--translate-up')
        item.classList.add('to-watch-translate-up')
      }
    })

    setTimeout(() => {
      checkAllButtonRef.current.classList.remove('to-watch-translate-up')
      episodesArrayList.forEach((item) => {
        item.classList.remove('episodes__episode--fade-out')
        // item.classList.remove('episodes__episode--translate-up')
        item.classList.remove('to-watch-translate-up')
        // item.style.animation = ''
      })
      seasonsArrayList.forEach((item) => {
        // item.classList.remove('episodes__episode-group--translate-up')
        item.classList.remove('to-watch-translate-up')
      })
      toWatchShowElement?.style.setProperty('--translateUpValue', '-51px')
    }, TO_WATCH_ANIMATION_DURATION)
  }

  if (isAllReleasedEpisodesWatched) {
    return null
  }

  const seasonYearRelease = format(new Date(seasonData?.air_date ?? ''), 'yyyy')

  return (
    <div className="episodes__episode-group" data-seasonnumber={seasonData.season_number}>
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
          <div ref={episodesListRef} className="episodes__episode-list">
            {seasonEpisodes?.map((episode) => {
              return (
                <ToWatchEpisode
                  key={episode.id}
                  showId={showData.id}
                  episodeData={episode}
                  episodesListRef={episodesListRef}
                  handleEpisodeCheck={handleEpisodeCheck}
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
