import React, { Component } from "react"
import ContentResults from "../Templates/ContentResults"
import PlaceholderNoSelectedContent from "../Placeholders/PlaceholderNoSelectedContent"
import { SelectedContentContext } from "../Context/SelectedContentContext"

export default class Shows extends Component {
  render() {
    const onlyShows = this.context.selectedContent.filter(
      item => item.original_name
    )
    return (
      <>
        {onlyShows.length ? (
          <div className="content-results">
            <ContentResults
              contentArr={onlyShows}
              toggleContentArr={onlyShows}
            />
          </div>
        ) : (
          <PlaceholderNoSelectedContent />
        )}
      </>
    )
  }
}

Shows.contextType = SelectedContentContext
