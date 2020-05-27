import React from "react"
import { Link } from "react-router-dom"
import * as ROUTES from "Utils/Constants/routes"

export default function PlaceholderNoShows({ section }) {
  let message
  const link = (
    <Link className="placeholder--no-shows__link" to={ROUTES.SEARCH_PAGE}>
      Search page
    </Link>
  )

  if (section === "watchingShows") {
    message = <h1>Choose some shows to watch at the {link}</h1>
  } else if (section === "droppedShows") {
    message = <h1>You haven't dropped any shows... yet</h1>
  } else if (section === "willWatchShows") {
    message = <h1>Here will be shows you plan to watch</h1>
  }

  return <div className="placeholder--no-shows">{message}</div>
}