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
  showId: number
  showDatabase: UserShowStatuses
  detailes: MainDataTMDB
  newShowStatus: UserShowStatuses
  buttonTitle: UserShowStatusReadable | JSX.Element
}

const ButtonWithWarning: React.FC<Props> = ({ showId, showDatabase, newShowStatus, detailes, buttonTitle }) => {
  const { firebase, authUser } = useFrequentVariables()
  const dispatch = useAppDispatch()
  const localStorageHandlers = useContext(LocalStorageHandlersContext)

  const [showDisableWarning, handleDisableWarning, fadeOutStart, ref] = useDisableWarning()

  return (
    <>
      <button
        ref={ref}
        className={classNames('button', {
          'button--pressed': showDatabase === newShowStatus,
          'button--not-logged-in': !authUser?.uid,
        })}
        type="button"
        onClick={(e) => {
          console.log({ authUser })
          if (!authUser?.uid) {
            handleDisableWarning(e)
            return
          }
          dispatch(
            handleUserShowStatus({
              showId,
              database: newShowStatus,
              showFullDetailes: detailes,
              firebase,
              localStorageHandlers,
            }),
          )
        }}
      >
        {buttonTitle}
      </button>

      {showDisableWarning && <DisableWarning fadeOutStart={fadeOutStart} />}
    </>
  )
}

export default ButtonWithWarning
