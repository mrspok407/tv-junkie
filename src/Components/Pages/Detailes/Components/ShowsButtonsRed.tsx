import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import * as ROUTES from 'Utils/Constants/routes'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { selectShowDatabase } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { handleDatabaseChange } from 'Components/UserContent/UseUserShowsRed/FirebaseHelpers/PostData'
import { fetchShowEpisodes } from 'Components/UserContent/UseUserShowsRed/Middleware'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  id: number
  detailes: MainDataTMDB
  mediaType: string
}

const ShowsButtons: React.FC<Props> = ({ id, detailes, mediaType }) => {
  const { firebase, authUser, userContentLocalStorage } = useFrequentVariables()

  const [disableBtnWarning, setDisableBtnWarning] = useState<string | null>(null)
  const notAuthButtons = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const showDatabase = useAppSelector((state) => selectShowDatabase(state, id))

  useEffect(() => {
    if (mediaType !== 'show' || !authUser?.uid || showDatabase === 'notWatchingShows') return
    dispatch(fetchShowEpisodes(Number(id), authUser.uid, firebase))
  }, [id, mediaType, showDatabase, authUser, firebase, dispatch])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside as EventListener)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClickOutside = (e: CustomEvent) => {
    if (authUser?.uid) return
    if (!notAuthButtons?.current?.contains(e.target as Node)) {
      setDisableBtnWarning(null)
    }
  }

  const showDissableBtnWarning = (btn: string) => {
    if (authUser?.uid) return
    setDisableBtnWarning(btn)
  }

  return (
    <div className="buttons__row">
      <div className="buttons__col">
        <button
          className={classNames('button', {
            'button--pressed':
              ['watchingShows', 'finishedShows'].includes(showDatabase) ||
              userContentLocalStorage.watchingShows.find((item: any) => item.id === Number(id)),
          })}
          type="button"
          onClick={() => {
            if (authUser?.uid) {
              dispatch(
                handleDatabaseChange({
                  id,
                  database: 'watchingShows',
                  showDetailesTMDB: detailes,
                  firebase,
                }),
              )
            } else {
              userContentLocalStorage.addShowLS({
                id: Number(id),
                data: detailes,
              })
            }
          }}
        >
          Watching
        </button>
      </div>

      <div className="buttons__col">
        <button
          className={classNames('button', {
            'button--pressed':
              showDatabase === 'notWatchingShows' ||
              (!authUser?.uid && !userContentLocalStorage.watchingShows.find((item: any) => item.id === Number(id))),
          })}
          type="button"
          onClick={() => {
            if (authUser?.uid) {
              dispatch(
                handleDatabaseChange({
                  id,
                  database: 'notWatchingShows',
                  showDetailesTMDB: detailes,
                  firebase,
                }),
              )
            } else {
              userContentLocalStorage.removeShowLS({
                id: Number(id),
              })
            }
          }}
        >
          Not watching
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
              if (authUser?.uid) {
                dispatch(
                  handleDatabaseChange({
                    id,
                    database: 'droppedShows',
                    showDetailesTMDB: detailes,
                    firebase,
                  }),
                )
              } else {
                showDissableBtnWarning('dropBtn')
              }
            }}
          >
            Drop
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
              if (authUser?.uid) {
                dispatch(
                  handleDatabaseChange({
                    id,
                    database: 'willWatchShows',
                    showDetailesTMDB: detailes,
                    firebase,
                  }),
                )
              } else {
                showDissableBtnWarning('willWatchBtn')
              }
            }}
          >
            Will watch
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
