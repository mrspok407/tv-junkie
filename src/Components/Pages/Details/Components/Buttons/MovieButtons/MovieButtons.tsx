import { useAppDispatch, useAppSelector } from 'app/hooks'
import classNames from 'classnames'
import {
  LocalStorageHandlersContext,
  LocalStorageValueContext,
} from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { handleMovie } from 'Components/UserContent/UseUserMoviesRed/ClientHandlers/movieHandlers'
import { updateMovieFinished } from 'Components/UserContent/UseUserMoviesRed/DatabaseHandlers/PostData/postMovieData'
import { selectMovie } from 'Components/UserContent/UseUserMoviesRed/userMoviesSliceRed'
import React, { useContext } from 'react'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import ButtonWithWarning from '../ButtonWithWarning'
import './MovieButtons.scss'

type Props = {
  movieId: number
  details: MainDataTMDB
}

const MovieButtons: React.FC<Props> = ({ movieId, details }: Props) => {
  const { authUser, firebase } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const localStorageContent = useContext(LocalStorageValueContext)
  const localStorageHandlers = useContext(LocalStorageHandlersContext)

  const movieFromLS = localStorageContent.watchLaterMovies.find((item: { id: number }) => item.id === Number(movieId))
  const movieFromStore = useAppSelector((state) => selectMovie(state, movieId))

  const isMovieSelected = movieFromStore || movieFromLS

  const renderIsFinishedTitle = () => {
    if (!authUser?.uid) {
      return 'Mark as finished'
    }
    if (movieFromStore?.finished) {
      return 'Finished'
    }
    return 'Mark as finished'
  }

  return (
    <div className="buttons__row buttons__row--movies">
      <div className="buttons__col">
        <button
          className={classNames('button', {
            'button--pressed': isMovieSelected,
          })}
          onClick={() => {
            dispatch(handleMovie({ movieId, movieFullDetails: details, firebase, localStorageHandlers }))
          }}
          type="button"
        >
          {isMovieSelected ? 'Remove from watch later' : 'Watch later'}
        </button>
      </div>
      <div className="buttons__col">
        <ButtonWithWarning
          isDisabled={!movieFromStore && !!authUser.uid}
          isPressed={!!(movieFromStore?.finished && authUser.uid)}
          onClick={() => {
            dispatch(updateMovieFinished({ movieId, firebase }))
          }}
        >
          {renderIsFinishedTitle()}
        </ButtonWithWarning>
      </div>
    </div>
  )
}

export default MovieButtons
