import React, { Component } from "react"
import ContentResults from "../Templates/ContentResults/ContentResults"
import PlaceholderNoSelectedContent from "../Placeholders/PlaceholderNoSelectedContent"
import { SelectedContentContext } from "../Context/SelectedContentContext"
import ScrollToTop from "../../Utils/ScrollToTop"

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
              className="content-results__wrapper--movies-page"
            />
          </div>
        ) : (
          <PlaceholderNoSelectedContent />
        )}
        <ScrollToTop />
      </>
    )
  }
}

Movies.contextType = SelectedContentContext
