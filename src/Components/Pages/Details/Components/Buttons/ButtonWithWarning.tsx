import classNames from 'classnames'
import useDisableWarning from 'Components/UI/Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/Components/Episode/Hooks/UseDisableWarning'
import React from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import DisableWarning from 'Components/UI/DisabledWarning/DisabledWarning'

type Props = {
  children: React.ReactNode
  onClick?: () => any
  isPressed: boolean
  isDisabled?: boolean
}

const ButtonWithWarning: React.FC<Props> = ({ isPressed, children, onClick, isDisabled = false }) => {
  const { authUser } = useFrequentVariables()
  const [showDisableWarning, handleDisableWarning, fadeOutStart, ref] = useDisableWarning()

  return (
    <>
      <button
        disabled={isDisabled}
        ref={ref}
        className={classNames('button', {
          'button--pressed': isPressed,
          'button--disable': !authUser?.uid || isDisabled,
        })}
        type="button"
        onClick={(e) => {
          if (!authUser?.uid) {
            handleDisableWarning(e)
            return
          }
          if (!onClick) return
          onClick()
        }}
      >
        {children}
      </button>

      {showDisableWarning && <DisableWarning fadeOutStart={fadeOutStart} />}
    </>
  )
}

export default ButtonWithWarning
