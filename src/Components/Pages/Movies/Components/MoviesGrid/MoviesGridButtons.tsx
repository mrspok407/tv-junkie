import React, { useContext } from 'react'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { useAppDispatch } from 'app/hooks'
import { LocalStorageHandlersContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { MovieInfoStoreState } from 'Components/UserContent/UseUserMoviesRed/@Types'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import {
  handleRemoveMovieFromDatabase,
  updateMovieFinished,
} from 'Components/UserContent/UseUserMoviesRed/DatabaseHandlers/PostData/postMovieData'
import classNames from 'classnames'
import { MovieSectionOptions } from '../../ReducerConfig/@Types'

type Props = {
  movieData: MainDataTMDB | MovieInfoStoreState
  section: MovieSectionOptions
}

const MoviesGridButtons: React.FC<Props> = ({ movieData, section }) => {
  const { authUser, firebase } = useFrequentVariables()
  const localStorageHandlers = useContext(LocalStorageHandlersContext)

  const dispatch = useAppDispatch()

  const renderButtons = () => {
    if (section === MovieSectionOptions.WatchLater) {
      return (
        <>
          <div className="buttons__row buttons__row--movies">
            <div className="buttons__col">
              <button
                onClick={() => {
                  dispatch(handleRemoveMovieFromDatabase({ movieId: movieData.id, firebase }))
                }}
                className="button"
                type="button"
              >
                Remove
              </button>
            </div>

            <div className="buttons__col">
              <button
                onClick={() => {
                  dispatch(updateMovieFinished({ movieId: movieData.id, firebase }))
                }}
                className={classNames('button', {
                  'button--pressed': movieData.finished,
                })}
                type="button"
              >
                Finished
              </button>
            </div>
          </div>
        </>
      )
    }

    if (section === MovieSectionOptions.Finished) {
      return (
        <button
          onClick={() => {
            dispatch(handleRemoveMovieFromDatabase({ movieId: movieData.id, firebase }))
          }}
          className="button"
          type="button"
        >
          Remove
        </button>
      )
    }
  }

  const renderButtonsNotAuth = () => {
    return (
      <button
        onClick={() => {
          localStorageHandlers.removeMovie({
            movieId: movieData.id,
          })
        }}
        className="button"
        type="button"
      >
        Remove
      </button>
    )
  }

  return <>{authUser?.uid ? renderButtons() : renderButtonsNotAuth()}</>
}

export default MoviesGridButtons
