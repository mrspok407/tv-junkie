import React from 'react'
import { useAppDispatch } from 'app/hooks'
import { SingleEpisodeStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { postCheckSingleEpisode } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/PostData/postShowEpisodesData'
import { handleShowsError } from 'Components/UserContent/UseUserShowsRed/ErrorHandlers/handleShowsError'
import {
  CHECK_ALL_EPISODES_BUTTON_CLASS,
  TO_WATCH_FADE_OUT_CLASS,
  TO_WATCH_TRANSLATE_DURATION,
  TO_WATCH_TRANSLATE_UP_CLASS,
  TO_WATCH_TRANSLATE_UP_VALUE_DEFAULT,
  TO_WATCH_TRANSLATE_UP_VALUE_SEASON_FADE_OUT,
  TO_WATCH_TRANSLATE_UP_VALUE_SHOW_FADE_OUT,
  TO_WATCH_TRANSLATE_UP_VAR,
} from 'Utils/Constants'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { getSeasonEpisodes, getSeasons } from 'Components/Pages/ToWatchEpisodes/Helpers'
import { differenceInCalendarDays } from 'date-fns'
import { currentDate } from 'Utils'

type Props = {
  episodeData: SingleEpisodeStoreState
  showsListRef: React.MutableRefObject<HTMLDivElement>
  seasonsListRef: React.MutableRefObject<HTMLDivElement>
  episodesListRef: React.MutableRefObject<HTMLDivElement>
  checkAllButtonRef: React.MutableRefObject<HTMLDivElement>
  isCheckEpisodeAnimationRunning: React.MutableRefObject<boolean>
  showIndex: number
  showId: number
}

interface HandleAnimationFinishT {
  episodesArrayList: HTMLElement[]
  seasonsArrayList: HTMLElement[]
  showsArrayList: HTMLElement[]
  rating?: number
}

const root = document.documentElement

const useHandleEpisodeCheck = ({
  episodeData,
  showsListRef,
  seasonsListRef,
  episodesListRef,
  isCheckEpisodeAnimationRunning,
  showIndex,
  showId,
}: Props) => {
  const { authUser, firebase } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const handleEpisodeCheck = (rating?: number) => {
    if (isCheckEpisodeAnimationRunning.current) return
    isCheckEpisodeAnimationRunning.current = true

    const { episodesArrayList, seasonsArrayList, showsArrayList } = getNodeLists()

    const seasonEpisodesStore = dispatch(getSeasonEpisodes({ showId, seasonNumber: episodeData.originalSeasonIndex }))
    const showEpisodesStore = dispatch(getSeasons({ showId }))

    const isLastReleasedEpisodeInSeason =
      seasonEpisodesStore?.filter(
        (episode) => !episode.watched && differenceInCalendarDays(new Date(episode.air_date), currentDate) <= 0,
      ).length === 1
    const isLastReleasedSeasonInShow =
      showEpisodesStore?.filter(
        (season) =>
          !season.allReleasedEpisodesWatched && differenceInCalendarDays(new Date(season.air_date), currentDate) <= 0,
      ).length === 1
    const isLastReleasedEpisodeInShow = isLastReleasedEpisodeInSeason && isLastReleasedSeasonInShow

    if (isLastReleasedEpisodeInSeason) {
      const translateValue = isLastReleasedSeasonInShow
        ? TO_WATCH_TRANSLATE_UP_VALUE_SHOW_FADE_OUT
        : TO_WATCH_TRANSLATE_UP_VALUE_SEASON_FADE_OUT
      root.style.setProperty(TO_WATCH_TRANSLATE_UP_VAR, `-${translateValue}px`)
    }

    handleEpisodeNodes(episodesArrayList)

    handleSeasonNodes(seasonsArrayList, isLastReleasedEpisodeInSeason)

    handleShowNodes(showsArrayList, isLastReleasedEpisodeInShow)

    handleAnimationFinish({ episodesArrayList, seasonsArrayList, showsArrayList, rating })
  }

  const handleAnimationFinish = ({
    episodesArrayList,
    seasonsArrayList,
    showsArrayList,
    rating,
  }: HandleAnimationFinishT) => {
    setTimeout(() => {
      isCheckEpisodeAnimationRunning.current = false

      episodesArrayList.forEach((item) => {
        item.classList.remove(TO_WATCH_FADE_OUT_CLASS, TO_WATCH_TRANSLATE_UP_CLASS)
      })
      seasonsArrayList.forEach((item) => {
        const nodeCheckAll = item.querySelector(CHECK_ALL_EPISODES_BUTTON_CLASS)
        item.classList.remove(TO_WATCH_TRANSLATE_UP_CLASS, TO_WATCH_FADE_OUT_CLASS)
        nodeCheckAll?.classList.remove(TO_WATCH_TRANSLATE_UP_CLASS, TO_WATCH_FADE_OUT_CLASS)
      })
      showsArrayList.forEach((item) => {
        item.classList.remove(TO_WATCH_TRANSLATE_UP_CLASS, TO_WATCH_FADE_OUT_CLASS)
      })

      document.documentElement.style.setProperty(TO_WATCH_TRANSLATE_UP_VAR, `-${TO_WATCH_TRANSLATE_UP_VALUE_DEFAULT}px`)

      if (rating === undefined) {
        dispatch(
          postCheckSingleEpisode({
            showId,
            seasonNumber: episodeData.originalSeasonIndex,
            episodeNumber: episodeData.originalEpisodeIndex,
            firebase,
          }),
        )
      } else {
        handleCheckWithRating(rating)
      }
    }, TO_WATCH_TRANSLATE_DURATION)
  }

  const handleEpisodeNodes = (elementsArray: HTMLElement[]) => {
    elementsArray.forEach((item) => {
      const nodeEpisodeNumber = Number(item.dataset.episodenumber)
      if (nodeEpisodeNumber === episodeData.episode_number) {
        item.classList.add(TO_WATCH_FADE_OUT_CLASS)
      }
      if (nodeEpisodeNumber < episodeData.episode_number) {
        item.classList.add(TO_WATCH_TRANSLATE_UP_CLASS)
      }
    })
  }

  const handleSeasonNodes = (elementsArray: HTMLElement[], isLastEpisodeInSeason: boolean) => {
    elementsArray.forEach((item) => {
      const nodeCheckAll = item.querySelector(CHECK_ALL_EPISODES_BUTTON_CLASS)
      const nodeSeasonNumber = Number(item.dataset.seasonnumber)

      if (nodeSeasonNumber === episodeData.season_number) {
        if (isLastEpisodeInSeason) {
          item.classList.add(TO_WATCH_FADE_OUT_CLASS)
          nodeCheckAll?.classList.add(TO_WATCH_FADE_OUT_CLASS)
        } else {
          nodeCheckAll?.classList.add(TO_WATCH_TRANSLATE_UP_CLASS)
        }
      }
      if (nodeSeasonNumber < episodeData.season_number) {
        item.classList.add(TO_WATCH_TRANSLATE_UP_CLASS)
      }
    })
  }

  const handleShowNodes = (elementsArray: HTMLElement[], isLastEpisodeInShow: boolean) => {
    elementsArray.forEach((item) => {
      const nodeShowIndex = Number(item.dataset.index)
      if (nodeShowIndex === showIndex && isLastEpisodeInShow) {
        item.classList.add(TO_WATCH_FADE_OUT_CLASS)
      }
      if (nodeShowIndex > showIndex) {
        item.classList.add(TO_WATCH_TRANSLATE_UP_CLASS)
      }
    })
  }

  const handleCheckWithRating = (rating: number) => {
    try {
      firebase
        .userShowSingleEpisode({
          authUid: authUser?.uid,
          key: showId,
          seasonNumber: episodeData.originalSeasonIndex,
          episodeNumber: episodeData.originalEpisodeIndex,
        })
        .update({ userRating: rating, watched: true })
    } catch (error) {
      dispatch(handleShowsError(error))
    }
  }

  const getNodeLists = () => {
    const showsNodeList = showsListRef.current?.getElementsByClassName('towatch__show') as HTMLCollectionOf<HTMLElement>
    const seasonsNodeList = seasonsListRef.current?.getElementsByClassName(
      'episodes__episode-group',
    ) as HTMLCollectionOf<HTMLElement>
    const episodesNodeList = episodesListRef.current?.getElementsByClassName(
      'episodes__episode',
    ) as HTMLCollectionOf<HTMLElement>
    const episodesArrayList = Array.from(episodesNodeList)
    const seasonsArrayList = Array.from(seasonsNodeList)
    const showsArrayList = Array.from(showsNodeList)
    return { episodesArrayList, seasonsArrayList, showsArrayList }
  }

  return handleEpisodeCheck
}

export default useHandleEpisodeCheck
