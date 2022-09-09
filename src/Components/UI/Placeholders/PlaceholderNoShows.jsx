import React from 'react'
import { Link } from 'react-router-dom'
import * as ROUTES from 'Utils/Constants/routes'

const PlaceholderNoShows = ({ authUser, activeSection }) => {
  let message
  const messageForNonAuth = !authUser?.uid && activeSection !== 'watchingShows' && (
    <h1>
      To use full features please{' '}
      <Link className="placeholder--no-shows__link" to={ROUTES.LOGIN_PAGE}>
        register
      </Link>
      . Your already selected shows will be saved.
    </h1>
  )

  switch (activeSection) {
    case 'watchingShows':
      message = <h1>Here will be your currently watching shows</h1>
      break
    case 'droppedShows':
      message = <h1>You haven&apos;t dropped any shows... yet</h1>
      break
    case 'willWatchShows':
      message = <h1>Here will be shows you plan to watch</h1>
      break
    case 'finishedShows':
      message = <h1>Here will be your finished shows</h1>
      break
    default:
      break
  }

  return <div className="placeholder--no-shows">{messageForNonAuth || message}</div>
}

export default PlaceholderNoShows
