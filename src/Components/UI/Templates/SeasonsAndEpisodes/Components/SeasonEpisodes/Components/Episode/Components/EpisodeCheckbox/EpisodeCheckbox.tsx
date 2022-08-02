import React, { useState } from 'react'
import classNames from 'classnames'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import DisableWarning from 'Components/UI/DisabledWarning/DisabledWarning'
import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import { useAppSelector } from 'app/hooks'
import { selectShowEpisodes } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import useDisableWarning from '../../Hooks/UseDisableWarning'

type Props = {
  isDisabled: boolean
  episodeData: SingleEpisodeFromFireDatabase
  showId: number
}

const EpisodeCheckbox: React.FC<Props> = ({ isDisabled, episodeData, showId }: Props) => {
  const { authUser } = useFrequentVariables()
  const [showDisableWarning, handleDisableWarning, fadeOutStart, checkboxRef] = useDisableWarning()

  const isWatched = useAppSelector((state) => {
    if (!authUser?.uid) return false

    const episodesFromStore = selectShowEpisodes(state, showId)
    const season = episodesFromStore?.find((season) => season.season_number === episodeData.season_number)
    const episode = season?.episodes.find((episode) => episode.id === episodeData.id)
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
            // toggleWatchedEpisode(season.season_number, indexOfEpisode)
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
