/* eslint-disable array-callback-return */
import React, { useEffect, useRef, useState } from 'react'
import { differenceBtwDatesInDays, isArrayIncludes, currentDate } from 'Utils'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import * as _get from 'lodash.get'
import * as ROUTES from 'Utils/Constants/routes'
import UserRating from 'Components/UI/UserRating/UserRating'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { EpisodesFromFireDatabase, SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import { SeasonFullData, ShowEpisodesFromAPIInt } from '../../@Types'
import TorrentLinksEpisodes from './Components/TorrentLinksEpisodes/TorrentLinksEpisodes'
import Episode from './Components/Episode/Episode'

type Props = {
  seasonData: SeasonFullData
  showCheckboxes: boolean
  showId: number
}

export interface HandleFadeOutInterface {
  episodeId: number
  episodeIndex: number
  seasonNum: number
  rating?: number
}

const SeasonEpisodes: React.FC<Props> = ({ seasonData, showCheckboxes, showId }) => {
  const { authUser } = useFrequentVariables()

  const [disableCheckboxWarning, setDisableCheckboxWarning] = useState<number | null>(null)

  const episodeRef = useRef<HTMLDivElement>(null)
  const checkboxRef = useRef<HTMLDivElement>(null)
  const registerWarningRef = useRef<HTMLDivElement>(null)

  const [openEpisodes, setOpenEpisodes] = useState<number[]>([])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside as EventListener)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener)
    }
    // eslint-disable-next-line
  }, [])

  const handleClickOutside = (e: CustomEvent) => {
    if (authUser?.uid) return
    if (
      checkboxRef.current &&
      registerWarningRef.current &&
      !checkboxRef.current.contains(e.target as Node) &&
      !registerWarningRef.current.contains(e.target as Node)
    ) {
      setDisableCheckboxWarning(null)
    }
  }

  const showDissableCheckboxWarning = (checkboxId: number) => {
    if (authUser?.uid) return
    setDisableCheckboxWarning(checkboxId)
  }

  // const handleFadeOut = ({ episodeId, episodeIndex, seasonNum, rating }: HandleFadeOutInterface) => {
  //   if (fadeOutEpisodes.find((item: any) => item.id === episodeId)) return
  //   window.clearTimeout(episodeFadeOutTimeout.current || 0)
  //   setTimedOut(false)

  //   setFadeOutEpisodes((prevState) => [...prevState, { id: episodeId, index: episodeIndex, seasonNum, rating }])

  //   episodeFadeOutTimeout.current = window.setTimeout(() => {
  //     setTimedOut(true)
  //   }, FADE_OUT_SPEED)
  // }

  // const showSeason = showCheckboxes && episodesFromDatabase[season.season_number - 1]
  // const seasons = episodesDataFromAPI

  return (
    <div className="episodes__episode-list">
      {seasonData.episodes.map((episode, episodeIndex, array) => {
        const episodeNumberForFirebase = array.length - 1 - episodeIndex
        return (
          <Episode
            key={episode.id}
            episodeData={episode}
            episodeNumberForFirebase={episodeNumberForFirebase}
            seasonNumber={seasonData.season_number}
            showCheckboxes={showCheckboxes}
            showId={showId}
            showTitle={seasonData.showTitle}
          />
        )
      })}
    </div>
  )
}

export default SeasonEpisodes
