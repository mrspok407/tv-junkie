import React from "react"

export default function PlaceholderNoShows({ section, authUser, activeSection }) {
  let message
  const messageForNonAuth = !authUser && activeSection !== "watchingShows" && (
    <h1>To use full features please register. Your allready selected shows will be saved.</h1>
  )

  if (section === "watchingShows") {
    message = <h1>Here will be your currently watching shows</h1>
  } else if (section === "droppedShows") {
    message = <h1>You haven't dropped any shows... yet</h1>
  } else if (section === "willWatchShows") {
    message = <h1>Here will be shows you plan to watch</h1>
  } else if (section === "finishedShows") {
    message = <h1>Here will be your finished shows</h1>
  }

  return <div className="placeholder--no-shows">{messageForNonAuth || message}</div>
}
