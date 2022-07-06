import React, { useCallback, useContext, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import * as ROUTES from 'Utils/Constants/routes'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { selectLoadingNewShow, selectShowDatabase } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useClickOutside from 'Utils/Hooks/UseClickOutside'
import { handleUserShowStatus } from 'Components/UserContent/UseUserShowsRed/ClientHandlers/showHandlers'
import { showStatusMapper, UserShowStatuses } from 'Components/UserContent/UseUserShowsRed/@Types'
import {
  LocalStorageHandlersContext,
  LocalStorageValueContext,
} from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'

type Props = {
  id: number
  detailes: MainDataTMDB
}

const ShowsButtons: React.FC<Props> = ({ id, detailes }) => {
  const { firebase, authUser } = useFrequentVariables()
  const localStorageContent = useContext(LocalStorageValueContext)
  const localStorageHandlers = useContext(LocalStorageHandlersContext)

  const dispatch = useAppDispatch()

  const [disableBtnWarning, setDisableBtnWarning] = useState<string | null>(null)
  const notAuthButtons = useRef<HTMLDivElement>(null!)

  const showDatabase = useAppSelector((state) => selectShowDatabase(state, id))
  const loadingNewShow = useAppSelector(selectLoadingNewShow)

  const handleDisableWarnings = useCallback(() => {
    if (authUser?.uid) return
    setDisableBtnWarning(null)
  }, [authUser])

  useClickOutside({ ref: notAuthButtons, callback: handleDisableWarnings })

  const showDissableBtnWarning = (btn: string) => {
    if (authUser?.uid) return
    setDisableBtnWarning(btn)
  }

  const buttonTitle = (showStatus: Exclude<UserShowStatuses, ''>) =>
    loadingNewShow === showStatus ? <span className="button-loader-circle" /> : showStatusMapper[showStatus]

  const showExistsInLocalStorage = localStorageContent.watchingShows.find((item) => item.id === Number(id))
  return (
    <div className="buttons__row">
      <div className="buttons__col">
        <button
          className={classNames('button', {
            'button--pressed': ['watchingShows', 'finishedShows'].includes(showDatabase) || showExistsInLocalStorage,
          })}
          type="button"
          onClick={() => {
            dispatch(
              handleUserShowStatus({
                id,
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
                id,
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
      <div className="buttons__col-wrapper" ref={notAuthButtons}>
        <div className="buttons__col">
          <button
            className={classNames('button', {
              'button--pressed': showDatabase === 'droppedShows',
              'button--not-logged-in': !authUser?.uid,
            })}
            type="button"
            onClick={() => {
              if (!authUser?.uid) {
                showDissableBtnWarning('dropBtn')
                return
              }
              dispatch(
                handleUserShowStatus({
                  id,
                  database: 'droppedShows',
                  showFullDetailes: detailes,
                  firebase,
                  localStorageHandlers,
                }),
              )
            }}
          >
            {buttonTitle('droppedShows')}
          </button>

          {disableBtnWarning === 'dropBtn' && (
            <div className="buttons__col-warning">
              To use full features please{' '}
              <Link className="buttons__col-link" to={ROUTES.LOGIN_PAGE}>
                register
              </Link>
              . Your allready selected shows will be saved.
            </div>
          )}
        </div>
        <div className="buttons__col">
          <button
            className={classNames('button', {
              'button--pressed': showDatabase === 'willWatchShows',
              'button--not-logged-in': !authUser?.uid,
            })}
            type="button"
            onClick={() => {
              if (!authUser?.uid) {
                showDissableBtnWarning('willWatchBtn')
                return
              }
              dispatch(
                handleUserShowStatus({
                  id,
                  database: 'willWatchShows',
                  showFullDetailes: detailes,
                  firebase,
                  localStorageHandlers,
                }),
              )
            }}
          >
            {buttonTitle('willWatchShows')}
          </button>
          {disableBtnWarning === 'willWatchBtn' && (
            <div className="buttons__col-warning">
              To use full features please{' '}
              <Link className="buttons__col-link" to={ROUTES.LOGIN_PAGE}>
                register
              </Link>
              . Your allready selected shows will be saved.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShowsButtons
