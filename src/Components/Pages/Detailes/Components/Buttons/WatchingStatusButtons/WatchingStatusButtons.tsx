import React, { useContext } from 'react'
import classNames from 'classnames'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { selectLoadingNewShow, selectShowDatabase } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { handleUserShowStatus } from 'Components/UserContent/UseUserShowsRed/ClientHandlers/showHandlers'
import { showStatusMapper, UserShowStatuses } from 'Components/UserContent/UseUserShowsRed/@Types'
import {
  LocalStorageHandlersContext,
  LocalStorageValueContext,
} from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import ButtonWithWarning from '../ButtonWithWarning'

type Props = {
  showId: number
  detailes: MainDataTMDB
}

const WatchingStatusButtons: React.FC<Props> = ({ showId, detailes }) => {
  const { firebase, authUser } = useFrequentVariables()
  const localStorageContent = useContext(LocalStorageValueContext)
  const localStorageHandlers = useContext(LocalStorageHandlersContext)

  const dispatch = useAppDispatch()

  const showDatabase = useAppSelector((state) => selectShowDatabase(state, showId))
  const loadingNewShow = useAppSelector(selectLoadingNewShow)

  const buttonTitle = (showStatus: Exclude<UserShowStatuses, ''>) =>
    loadingNewShow === showStatus ? <span className="button-loader-circle" /> : showStatusMapper[showStatus]

  const showExistsInLocalStorage = localStorageContent.watchingShows.find((item) => item.id === Number(showId))
  return (
    <div className="buttons__row">
      <div className="buttons__col">
        <button
          className={classNames('button', {
            'button--pressed': ['watchingShows', 'finishedShows'].includes(showDatabase!) || showExistsInLocalStorage,
          })}
          type="button"
          onClick={() => {
            dispatch(
              handleUserShowStatus({
                showId,
                database: 'watchingShows',
                showFullDetailes: detailes,
                firebase,
                localStorageHandlers,
              }),
            )
          }}
        >
          {buttonTitle('watchingShows')}
        </button>
      </div>

      <div className="buttons__col">
        <button
          className={classNames('button', {
            'button--pressed': showDatabase === 'notWatchingShows' || (!authUser?.uid && !showExistsInLocalStorage),
          })}
          type="button"
          onClick={() => {
            dispatch(
              handleUserShowStatus({
                showId,
                database: 'notWatchingShows',
                showFullDetailes: detailes,
                firebase,
                localStorageHandlers,
              }),
            )
          }}
        >
          {buttonTitle('notWatchingShows')}
        </button>
      </div>
      <div className="buttons__col-wrapper">
        <div className="buttons__col">
          <ButtonWithWarning
            isPressed={showDatabase === 'droppedShows'}
            onClick={() => {
              dispatch(
                handleUserShowStatus({
                  showId,
                  database: 'droppedShows',
                  showFullDetailes: detailes,
                  firebase,
                  localStorageHandlers,
                }),
              )
            }}
          >
            {buttonTitle('droppedShows')}
          </ButtonWithWarning>
        </div>
        <div className="buttons__col">
          <ButtonWithWarning
            isPressed={showDatabase === 'willWatchShows'}
            onClick={() => {
              dispatch(
                handleUserShowStatus({
                  showId,
                  database: 'willWatchShows',
                  showFullDetailes: detailes,
                  firebase,
                  localStorageHandlers,
                }),
              )
            }}
          >
            {buttonTitle('willWatchShows')}
          </ButtonWithWarning>
        </div>
      </div>
    </div>
  )
}

export default WatchingStatusButtons
