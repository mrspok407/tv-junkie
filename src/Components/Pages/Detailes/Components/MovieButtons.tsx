import classNames from 'classnames'
import {
  LocalStorageHandlersContext,
  LocalStorageValueContext,
} from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import React, { useContext } from 'react'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

type Props = {
  id: number
  detailes: MainDataTMDB
}

const MovieButtons: React.FC<Props> = ({ id, detailes }: Props) => {
  const localStorageContent = useContext(LocalStorageValueContext)
  const { toggleMovie } = useContext(LocalStorageHandlersContext)
  const movie = localStorageContent.watchLaterMovies.find((item: { id: number }) => item.id === Number(id))
  return (
    <button
      className={classNames('button', {
        'button--pressed': movie,
      })}
      onClick={() => toggleMovie({ id, data: detailes })}
      type="button"
    >
      {movie ? 'Remove' : 'Watch later'}
    </button>
  )
}

export default MovieButtons
