import React from 'react'

export default function PlaceholderNoShowsUser({ activeSection }) {
  let message

  if (activeSection === 'watchingShows') {
    message = <h1>This user is not watching anything</h1>
  } else if (activeSection === 'droppedShows') {
    message = <h1>Nothing is dropped yet</h1>
  } else if (activeSection === 'willWatchShows') {
    message = <h1>Shows planned to watch</h1>
  } else if (activeSection === 'finishedShows') {
    message = <h1>Here will be finished shows</h1>
  }

  return <div className="placeholder--no-shows">{message}</div>
}
