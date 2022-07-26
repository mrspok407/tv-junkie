import { useAppDispatch } from 'app/hooks'
import classNames from 'classnames'
import useDisableWarning from 'Components/UI/Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/Components/Episode/Hooks/UseDisableWarning'
import { handleUserShowStatus } from 'Components/UserContent/UseUserShowsRed/ClientHandlers/showHandlers'
import React, { useContext } from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { LocalStorageHandlersContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { UserShowStatuses, UserShowStatusReadable } from 'Components/UserContent/UseUserShowsRed/@Types'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import DisableWarning from 'Components/UI/DisabledWarning/DisabledWarning'

type Props = {
  children: React.ReactNode
  onClick?: () => any
  isPressed: boolean
}

const ButtonWithWarning: React.FC<Props> = ({ isPressed, children, onClick }) => {
  const { authUser } = useFrequentVariables()
  const [showDisableWarning, handleDisableWarning, fadeOutStart, ref] = useDisableWarning()

  return (
    <>
      <button
        ref={ref}
        className={classNames('button', {
          'button--pressed': isPressed,
          'button--not-logged-in': !authUser?.uid,
        })}
        type="button"
        onClick={(e) => {
          console.log({ authUser })
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
