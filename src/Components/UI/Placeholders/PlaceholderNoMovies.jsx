import React from 'react'
import { Link } from 'react-router-dom'
import * as ROUTES from 'Utils/Constants/routes'

const PlaceholderNoMovies = ({ authUser, activeSection }) => {
  let message
  const messageForNonAuth = !authUser?.uid && activeSection === 'finishedMovies' && (
    <h1>
      To use full features please{' '}
      <Link className="placeholder--no-shows__link" to={ROUTES.LOGIN_PAGE}>
        register
      </Link>
      . Your allready selected movies will be saved.
    </h1>
  )

  switch (activeSection) {
    case 'watchLaterMovies':
      message = <h1>Here will be your watch later list</h1>
      break
    case 'finishedMovies':
      message = <h1>Finished movies will be here</h1>
      break
    default:
      break
  }

  return <div className="placeholder--no-shows">{messageForNonAuth || message}</div>
}

export default PlaceholderNoMovies
