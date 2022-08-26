import React from 'react'
import classNames from 'classnames'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import DisableWarning from 'Components/UI/DisabledWarning/DisabledWarning'
import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import { useAppSelector } from 'app/hooks'
import { selectSingleEpisode } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import useDisableWarning from '../../Hooks/UseDisableWarning'
import './EpisodeCheckbox.scss'

type Props = {
  isDisabled: boolean
  episodeData: SingleEpisodeFromFireDatabase
  showId: number
  handleEpisodeCheck: (rating?: number) => void
}

const EpisodeCheckbox: React.FC<Props> = ({ isDisabled, episodeData, showId, handleEpisodeCheck }: Props) => {
  const { authUser } = useFrequentVariables()
  const [showDisableWarning, handleDisableWarning, fadeOutStart, checkboxRef] = useDisableWarning()

  const isWatched = useAppSelector((state) => {
    // const episode = selectSingleEpisode(state, showId, episodeData.season_number, episodeData.episode_number)
    const episode = selectSingleEpisode(state, showId, episodeData.season_number, episodeData.originalIndex + 1)
    return episode
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
          checked={!!(isWatched?.watched && !isDisabled)}
          onChange={() => handleEpisodeCheck()}
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
