import React from 'react'
import { useAppDispatch } from 'app/hooks'
import { SingleEpisodeStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { postCheckSingleEpisode } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/PostData/postShowEpisodesData'
import { handleShowsError } from 'Components/UserContent/UseUserShowsRed/ErrorHandlers/handleShowsError'
import { TO_WATCH_TRANSLATE_DURATION } from 'Utils/Constants'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

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

    episodesArrayList.forEach((item) => {
      const nodeEpisodeNumber = Number(item.dataset.episodenumber)
      if (nodeEpisodeNumber === episodeData.episode_number) {
        item.classList.add('episodes__episode--fade-out')
      }
      if (nodeEpisodeNumber < episodeData.episode_number) {
        item.classList.add('to-watch-translate-up')
      }
    })

    seasonsArrayList.forEach((item) => {
      const nodeCheckAll = item.querySelector('.episodes__episode-group-check-all-episodes')
      console.log({ nodeCheckAll })
      const nodeSeasonNumber = Number(item.dataset.seasonnumber)
      if (nodeSeasonNumber === episodeData.season_number) {
        nodeCheckAll?.classList.add('to-watch-translate-up')
      }
      if (nodeSeasonNumber < episodeData.season_number) {
        item.classList.add('to-watch-translate-up')
      }
    })

    showsArrayList.forEach((item) => {
      const nodeShowIndex = Number(item.dataset.index)
      if (nodeShowIndex > showIndex) {
        item.classList.add('to-watch-translate-up')
      }
    })

    setTimeout(() => {
      isCheckEpisodeAnimationRunning.current = false

      episodesArrayList.forEach((item) => {
        item.classList.remove('episodes__episode--fade-out')
        item.classList.remove('to-watch-translate-up')
      })
      seasonsArrayList.forEach((item) => {
        const nodeCheckAll = item.querySelector('.episodes__episode-group-check-all-episodes')
        item.classList.remove('to-watch-translate-up')
        nodeCheckAll?.classList.remove('to-watch-translate-up')
      })
      showsArrayList.forEach((item) => {
        item.classList.remove('to-watch-translate-up')
      })

      if (rating === undefined) {
        dispatch(
          postCheckSingleEpisode({
            showId,
            seasonNumber: episodeData.season_number,
            episodeNumber: episodeData.episode_number,
            firebase,
          }),
        )
      } else {
        handleCheckWithRating(rating)
      }
    }, TO_WATCH_TRANSLATE_DURATION)
  }

  const handleCheckWithRating = (rating: number) => {
    try {
      firebase
        .userShowSingleEpisode({
          authUid: authUser?.uid,
          key: showId,
          seasonNumber: episodeData.season_number,
          episodeNumber: episodeData.episode_number,
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
