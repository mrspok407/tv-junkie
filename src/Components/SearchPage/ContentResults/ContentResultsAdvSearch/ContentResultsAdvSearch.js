import React from "react"
import "./ContentResultsAdvSearch.scss"
import Loader from "../../../Placeholders/Loader"
import ContentResults from "../../../Templates/ContentResults"
import { SelectedContentContext } from "../../../Context/SelectedContentContext"

export default class MovieResultsAdvSearch extends React.PureComponent {
  render() {
    return (
      <div className="content-results">
        {this.props.advancedSearchContent.length > 0 && (
          <div className="content-results__button">
            <button
              type="button"
              className="button button--clear-movies"
              onClick={() => this.props.clearAdvSearchMovies()}
            >
              Clear Searched
            </button>
          </div>
        )}
        <ContentResults
          contentArr={this.props.advancedSearchContent}
          toggleContentArr={this.props.advancedSearchContent}
        />
        {this.props.loadingNewPage && <Loader className="loader--new-page" />}
      </div>
    )
  }
}

MovieResultsAdvSearch.contextType = SelectedContentContext
