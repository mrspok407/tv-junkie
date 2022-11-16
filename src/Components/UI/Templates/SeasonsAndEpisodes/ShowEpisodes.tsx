import React, { useCallback, useState } from 'react'
import classNames from 'classnames'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { selectShow, selectShowEpisodes } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { SeasonTMDB } from 'Utils/@TypesTMDB'
import { postCheckReleasedEpisodes } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/PostData/postShowEpisodesData'
import { releasedValidEpisodesToOneArray } from 'Components/UserContent/UseUserShowsRed/Utils/episodesOneArrayModifiers'
import useFetchSeasons from './Hooks/UseFetchSeasons/UseFetchSeasons'
import { ShowEpisodesFromAPIInt } from './@Types'
import SeasonsGrid from './Components/SeasonsGrid'
import { ActionTypesEnum } from './Hooks/UseFetchSeasons/ReducerConfig/@Types'
import './ShowsEpisodes.scss'

type Props = {
  seasonsTMDB: SeasonTMDB[]
  showId: number
}

const INITIAL_OPEN_SEASON = 1

const ShowEpisodes: React.FC<Props> = ({ seasonsTMDB, showId }) => {
  const { firebase, authUser } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const isAnyEpisodeReleased = useAppSelector((state) => {
    const episodes = selectShowEpisodes(state, showId)
    const releasedEpisodes = releasedValidEpisodesToOneArray(episodes)
    return releasedEpisodes.length
  })

  const initialOpenedSeason = seasonsTMDB[seasonsTMDB.length - INITIAL_OPEN_SEASON]

  const {
    state: seasonsData,
    handleFetch,
    dispatch: fetchSeasonsDispatch,
  } = useFetchSeasons<ShowEpisodesFromAPIInt>({
    showId,
    preloadSeason: initialOpenedSeason,
  })

  console.log(seasonsTMDB)

  const handleOpenSeasonEpisodes = useCallback(
    (seasonId: number, seasonNum: number) => {
      handleFetch({ seasonNum, seasonId })
    },
    [handleFetch],
  )

  const [isOpen, setIsOpen] = useState(false)
  const handleCloseAllOpenSeasons = () => {
    fetchSeasonsDispatch({ type: ActionTypesEnum.HandleCloseAll })
    setIsOpen(!isOpen)
  }

  const showCheckboxes = useAppSelector((state) => {
    const showInfo = selectShow(state, showId)
    return !!(showInfo && showInfo?.database !== 'notWatchingShows' && authUser?.uid)
  })
  const showCheckAllEpisodes = !!(showCheckboxes && isAnyEpisodeReleased)
  return (
    <>
      {showCheckAllEpisodes && (
        <>
          <div className="episodes__check-all-episodes">
            <button
              type="button"
              className="button"
              onClick={() => {
                dispatch(postCheckReleasedEpisodes({ firebase, showId }))
              }}
            >
              Check all episodes
            </button>
          </div>
        </>
      )}

      <div
        className={classNames('episodes__close-all-open', {
          'episodes__close-all-open--left': !showCheckAllEpisodes,
        })}
      >
        <button type="button" role="button" className="button" onClick={() => handleCloseAllOpenSeasons()}>
          {seasonsData.openData.length ? 'Close all' : 'Open all'}
        </button>
      </div>

      <SeasonsGrid
        showId={showId}
        seasonsTMDB={seasonsTMDB}
        handleOpenSeasonEpisodes={handleOpenSeasonEpisodes}
        seasonsData={seasonsData}
        showCheckboxes={showCheckboxes}
      />
    </>
  )
}

export default ShowEpisodes
