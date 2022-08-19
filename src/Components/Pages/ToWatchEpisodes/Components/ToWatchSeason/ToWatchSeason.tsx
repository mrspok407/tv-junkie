import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import {
  postCheckMultiplyEpisodes,
  postCheckReleasedEpisodes,
} from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/PostData/postShowEpisodesData'
import { TO_WATCH_ANIMATION_DURATION, TO_WATCH_TRANSLATE_UP_VALUE } from 'Utils/Constants'
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

  const root = document.documentElement
  const queueOfTrans = useRef<any>({})
  const tranEventOn = useRef(false)

  const episodesWatched = useRef<any>([])

  const episodesListRef = useRef<HTMLDivElement>(null!)
  const checkAllButtonRef = useRef<HTMLDivElement>(null!)

  const [isEpisodesOpen, setIsEpisodesOpen] = useState(seasonData.season_number === initialOpenSeasonNumber)

  const isAllReleasedEpisodesWatched = useAppSelector((state) => {
    const season = selectSingleSeason(state, showData.id, seasonData.season_number)
    return season?.allReleasedEpisodesWatched
  })!

  const seasonEpisodes = dispatch(getSeasonEpisodes({ showId: showData.id, seasonNumber: seasonData.season_number }))

  const test = () => {
    console.log('test')
    console.log(queueOfTrans.current)
  }

  const handleTransEnd = useCallback((e: any) => {
    const propName = e.propertyName
    if (propName !== 'transform') return
    const { dataset } = e.target
    const styles = window.getComputedStyle(e.target)
    const translateUpValue = Math.abs(Number.parseFloat(styles.getPropertyValue('--translateUpValue')))
    // const translateUpDuration = Math.abs(Number.parseFloat(styles.getPropertyValue('--translateUpDuration')))
    console.log(queueOfTrans.current)
    if (queueOfTrans.current[dataset.id!].amountTrans === 1) {
      queueOfTrans.current[dataset.id!] = {
        transInProgress: false,
        amountTrans: 0,
      }

      let isAnyTransInProgress = false

      Object.values(queueOfTrans.current).forEach((item: any) => {
        if (item.transInProgress === true) {
          isAnyTransInProgress = true
        }
      })

      if (!isAnyTransInProgress) {
        console.log('dispatch')

        const episodesNodeList = episodesListRef.current?.getElementsByClassName(
          'episodes__episode',
        ) as HTMLCollectionOf<HTMLElement>

        // const seasonsNodeList = seasonsListRef.current?.getElementsByClassName(
        //   'episodes__episode-group',
        // ) as HTMLCollectionOf<HTMLElement>

        const episodesArrayList = Array.from(episodesNodeList)
        // const seasonsArrayList = Array.from(seasonsNodeList)

        episodesArrayList.forEach((item) => {
          item.classList.remove('to-watch-translate-up')
          item.style.setProperty('--translateUpValue', `-${TO_WATCH_TRANSLATE_UP_VALUE}px`)
          // item.style.setProperty('--translateUpDuration', `${TO_WATCH_ANIMATION_DURATION}ms`)
        })

        // seasonsArrayList.forEach((item) => {
        //   item.classList.remove('to-watch-translate-up')
        //   item.style.setProperty('--translateUpValue', `-${TO_WATCH_TRANSLATE_UP_VALUE}px`)
        //   item.style.setProperty('--translateUpDuration', `${TO_WATCH_ANIMATION_DURATION}ms`)
        // })

        dispatch(postCheckMultiplyEpisodes({ showId: showData.id, episodes: episodesWatched.current, firebase }))
        episodesWatched.current = []
      }
    } else {
      e.target.style.setProperty('--translateUpValue', `-${translateUpValue + TO_WATCH_TRANSLATE_UP_VALUE}px`)
      queueOfTrans.current[dataset.id!].amountTrans = Math.max(0, queueOfTrans.current[dataset.id!]?.amountTrans - 1)
    }
  }, [])

  const handleEpisodeCheck = (episodeData: SingleEpisodeStoreState) => {
    episodesWatched.current.push(episodeData)

    const seasonsNodeList = seasonsListRef.current?.getElementsByClassName(
      'episodes__episode-group',
    ) as HTMLCollectionOf<HTMLElement>
    const episodesNodeList = episodesListRef.current?.getElementsByClassName(
      'episodes__episode',
    ) as HTMLCollectionOf<HTMLElement>

    const episodesArrayList = Array.from(episodesNodeList)
    const seasonsArrayList = Array.from(seasonsNodeList)

    episodesArrayList.forEach((item) => {
      if (Number(item.dataset.episodenumber) === episodeData.episode_number) {
        item.classList.add('episodes__episode--fade-out')
      }
      if (Number(item.dataset.episodenumber) < episodeData.episode_number) {
        item.classList.add('to-watch-translate-up')

        if (queueOfTrans.current[item.dataset.id!] === undefined) {
          console.log(queueOfTrans.current[item.id!])
          queueOfTrans.current[item.dataset.id!] = {
            transInProgress: true,
            amountTrans: 1,
          }
        } else {
          console.log(queueOfTrans.current[item.dataset.id!])
          queueOfTrans.current[item.dataset.id!] = {
            transInProgress: true,
            amountTrans: queueOfTrans.current[item.dataset.id!]?.amountTrans + 1,
          }
        }
      }

      if (!tranEventOn.current) {
        //   item.addEventListener('transitionend', handleTransEnd)
      }
    })
    // checkAllButtonRef.current.classList.add('to-watch-translate-up')

    // seasonsArrayList.forEach((item) => {
    //   if (Number(item.dataset.seasonnumber) < episodeData.season_number) {
    //     // item.classList.add('episodes__episode-group--translate-up')
    //     item.classList.add('to-watch-translate-up')

    //     if (queueOfTrans.current[item.dataset.id!] === undefined) {
    //       console.log(queueOfTrans.current[item.id!])
    //       queueOfTrans.current[item.dataset.id!] = {
    //         transInProgress: true,
    //         amountTrans: 1,
    //       }
    //     } else {
    //       console.log(queueOfTrans.current[item.dataset.id!])
    //       queueOfTrans.current[item.dataset.id!] = {
    //         transInProgress: true,
    //         amountTrans: queueOfTrans.current[item.dataset.id!]?.amountTrans + 1,
    //       }
    //     }

    //     if (!tranEventOn.current) {
    //       // item.addEventListener('transitionstart', handleTransStart)

    //       item.addEventListener('transitionend', handleTransEnd)

    //       //  item.addEventListener('transitionend', handleTransEnd)
    //     }
    //   }
    // })

    tranEventOn.current = true
  }

  if (isAllReleasedEpisodesWatched) {
    return null
  }

  const seasonYearRelease = format(new Date(seasonData?.air_date ?? ''), 'yyyy')

  return (
    <div className="episodes__episode-group" data-seasonnumber={seasonData.season_number} data-id={seasonData.id}>
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

          {/* <div ref={checkAllButtonRef} className="episodes__episode-group-check-all-episodes">
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
          </div> */}
        </>
      )}
    </div>
  )
}

export default ToWatchSeason
