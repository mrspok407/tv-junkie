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
  postCheckSingleEpisode,
} from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/PostData/postShowEpisodesData'
import { TO_WATCH_FADEOUT_DURATION, TO_WATCH_TRANSLATE_DURATION, TO_WATCH_TRANSLATE_UP_VALUE } from 'Utils/Constants'
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
  const queueOfTrans = useRef<{ [key: string | number]: { transInProgress: boolean; amountTrans: number } }>({})
  const tranEventOn = useRef(false)

  const episodesWatched = useRef<SingleEpisodeStoreState[]>([])

  const episodesListRef = useRef<HTMLDivElement>(null!)
  const checkAllButtonRef = useRef<HTMLDivElement>(null!)

  const [isEpisodesOpen, setIsEpisodesOpen] = useState(seasonData.season_number === initialOpenSeasonNumber)

  const isAllReleasedEpisodesWatched = useAppSelector((state) => {
    const season = selectSingleSeason(state, showData.id, seasonData.season_number)
    return season?.allReleasedEpisodesWatched
  })!

  const seasonEpisodes = dispatch(getSeasonEpisodes({ showId: showData.id, seasonNumber: seasonData.season_number }))

  const transitions = useRef<number[]>([])

  const handleTransEnd = useCallback((e: any) => {
    const propName = e.propertyName
    if (propName !== 'transform') return
    const { dataset } = e.target
    const styles = window.getComputedStyle(e.target)
    const translateUpValue = Math.abs(Number.parseFloat(styles.getPropertyValue('--translateUpValue')))
    // const translateUpDuration = Math.abs(Number.parseFloat(styles.getPropertyValue('--translateUpDuration')))

    console.log('trans END')
    const { episodesArrayList } = getNodeLists()
    episodesArrayList.forEach((item) => {
      const nodeEpisodeNumber = Number(item.dataset.episodenumber)

      item.classList.remove('to-watch-translate-up')
      item.style.setProperty('--translateUpValue', `-${TO_WATCH_TRANSLATE_UP_VALUE}px`)

      const index = transitions.current.indexOf(nodeEpisodeNumber)
      if (index > -1) {
        transitions.current.splice(index, 1)
      }
      // item.style.setProperty('--translateUpDuration', `${TO_WATCH_ANIMATION_DURATION}ms`)
    })

    console.log(transitions.current)
    if (!transitions.current.length && episodesWatched.current.length) {
      console.log('postCheckMultiplyEpisodes')
      dispatch(postCheckMultiplyEpisodes({ showId: showData.id, episodes: episodesWatched.current, firebase }))
      episodesWatched.current = []
    }

    // if (propName === 'opacity') {
    //   if (!transitions.current.length) {
    //     console.log('OPACITY postCheckMultiplyEpisodes')
    //     dispatch(postCheckMultiplyEpisodes({ showId: showData.id, episodes: episodesWatched.current, firebase }))
    //     episodesWatched.current = []
    //   }
    // }

    return
    if (queueOfTrans.current[dataset.id!].amountTrans === 1) {
      queueOfTrans.current[dataset.id!] = {
        transInProgress: false,
        amountTrans: 0,
      }

      const isAnyTransInProgress = Object.values(queueOfTrans.current).some((item) => item.transInProgress === true)

      if (!isAnyTransInProgress) {
        const { episodesArrayList } = getNodeLists()
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
    if (episodesWatched.current.find((item) => item.id === episodeData.id)) return

    const { episodesArrayList, seasonsArrayList } = getNodeLists()

    episodesWatched.current.push(episodeData)

    console.log({ episodesArrayList })

    let isTransitions = false

    episodesArrayList.forEach((item) => {
      const styles = window.getComputedStyle(item)
      const translateUpValue = Math.abs(Number.parseFloat(styles.getPropertyValue('--translateUpValue')))

      const nodeEpisodeNumber = Number(item.dataset.episodenumber)

      if (nodeEpisodeNumber === episodeData.episode_number) {
        item.classList.add('episodes__episode--fade-out')
      }

      if (nodeEpisodeNumber < episodeData.episode_number) {
        if (item.className.indexOf('episodes__episode--fade-out') > -1) {
          console.log('episode fading out')
          return
        }

        isTransitions = true
        if (!transitions.current.includes(nodeEpisodeNumber)) {
          transitions.current.push(nodeEpisodeNumber)
        }

        if (item.className.indexOf('to-watch-translate-up') === -1) {
          console.log('add class up')
          item.classList.add('to-watch-translate-up')
        } else {
          console.log('change var up value')
          // if (translateUpValue === TO_WATCH_TRANSLATE_UP_VALUE) {
          item.style.setProperty('--translateUpValue', `-${translateUpValue + TO_WATCH_TRANSLATE_UP_VALUE}px`)
          // }
        }

        // if (queueOfTrans.current[item.dataset.id!] === undefined) {
        //   queueOfTrans.current[item.dataset.id!] = {
        //     transInProgress: true,
        //     amountTrans: 1,
        //   }
        // } else {
        //   queueOfTrans.current[item.dataset.id!] = {
        //     transInProgress: true,
        //     amountTrans: queueOfTrans.current[item.dataset.id!]?.amountTrans + 1,
        //   }
        // }
      }

      console.log(transitions.current)

      if (!tranEventOn.current) {
        item.addEventListener('transitionend', handleTransEnd)
      }
    })

    if (!isTransitions) {
      setTimeout(() => {
        console.log('SINGLE postCheckMultiplyEpisodes')
        dispatch(postCheckMultiplyEpisodes({ showId: showData.id, episodes: [episodeData], firebase }))
        episodesWatched.current = []
      }, TO_WATCH_FADEOUT_DURATION)
    }
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

  const getNodeLists = () => {
    const seasonsNodeList = seasonsListRef.current?.getElementsByClassName(
      'episodes__episode-group',
    ) as HTMLCollectionOf<HTMLElement>
    const episodesNodeList = episodesListRef.current?.getElementsByClassName(
      'episodes__episode',
    ) as HTMLCollectionOf<HTMLElement>
    const episodesArrayList = Array.from(episodesNodeList)
    const seasonsArrayList = Array.from(seasonsNodeList)
    return { episodesArrayList, seasonsArrayList }
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
