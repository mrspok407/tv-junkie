import React from "react"
import Loader from "../../../Placeholders/Loader"
import ContentResults from "../../../Templates/ContentResults/ContentResults"
import { SelectedContentContext } from "../../../Context/SelectedContentContext"
import "./SearchResults.scss"

export default class MovieResultsAdvSearch extends React.PureComponent {
  render() {
    return (
      <div className="advanced-search-results-cont">
        <div className="content-results">
          {this.props.advancedSearchContent.length > 0 && (
            <div className="content-results__button--clear-searched">
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
      </div>
    )
  }
}

MovieResultsAdvSearch.contextType = SelectedContentContext
