import React from 'react'
import classNames from 'classnames'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import DisableWarning from 'Components/UI/DisabledWarning/DisabledWarning'
import useDisableWarning from '../../Hooks/UseDisableWarning'

type Props = {
  isDisabled: boolean
}

const EpisodeCheckbox: React.FC<Props> = ({ isDisabled }: Props) => {
  const { authUser } = useFrequentVariables()
  const [showDisableWarning, handleDisableWarning, fadeOutStart, checkboxRef] = useDisableWarning()

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
          // checked={_get(showSeason, `episodes.${indexOfEpisode}.watched`, false)}
          // checked={*data from store*}
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
