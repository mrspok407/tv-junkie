import React, { useState } from 'react'
import classNames from 'classnames'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import DisableWarning from 'Components/UI/DisabledWarning/DisabledWarning'
import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { selectShowEpisodes, selectSingleEpisode } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { postCheckSingleEpisode } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/PostData/postShowEpisodesData'
import useDisableWarning from '../../Hooks/UseDisableWarning'
import './EpisodeCheckbox.scss'

type Props = {
  isDisabled: boolean
  episodeData: SingleEpisodeFromFireDatabase
  showId: number
}

const EpisodeCheckbox: React.FC<Props> = ({ isDisabled, episodeData, showId }: Props) => {
  const { authUser, firebase } = useFrequentVariables()
  const dispatch = useAppDispatch()
  const [showDisableWarning, handleDisableWarning, fadeOutStart, checkboxRef] = useDisableWarning()

  const isWatched = useAppSelector((state) => {
    const episode = selectSingleEpisode(state, showId, episodeData.season_number, episodeData.episode_number)
    return episode?.watched ?? false
  })

  return (
    <div
      ref={checkboxRef}
      className="episodes__episode-checkbox"
      onClick={(e) => {
        if (authUser?.uid) return
        handleDisableWarning(e)
      }}
    >
      <label>
        <input
          type="checkbox"
          checked={isWatched}
          onChange={() => {
            dispatch(
              postCheckSingleEpisode({
                showId,
                seasonNumber: episodeData.season_number,
                episodeNumber: episodeData.episode_number,
                firebase,
              }),
            )
          }}
          disabled={isDisabled}
        />
        <span
          className={classNames('custom-checkmark', {
            'custom-checkmark--disabled': isDisabled,
          })}
        />
      </label>
      {showDisableWarning && <DisableWarning fadeOutStart={fadeOutStart} />}
    </div>
  )
}

export default EpisodeCheckbox
