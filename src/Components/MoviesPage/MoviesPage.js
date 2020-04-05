import React, { Component } from "react"
import ContentResults from "../Templates/ContentResults"
import PlaceholderNoSelectedContent from "../Placeholders/PlaceholderNoSelectedContent"
import { SelectedContentContext } from "../Context/SelectedContentContext"

export default class Movies extends Component {
  render() {
    const onlyMovies = this.context.selectedContent.filter(
      item => item.original_title
    )
    return (
      <>
        {onlyMovies.length ? (
          <div className="content-results">
            <ContentResults
              contentArr={onlyMovies}
              toggleContentArr={onlyMovies}
            />
          </div>
        ) : (
          <PlaceholderNoSelectedContent />
        )}
      </>
    )
  }
}

Movies.contextType = SelectedContentContext
