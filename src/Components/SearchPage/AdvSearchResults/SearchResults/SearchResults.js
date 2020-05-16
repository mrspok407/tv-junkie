import React from "react"
import Loader from "../../../Placeholders/Loader"
import ContentResults from "../../../Templates/ContentResults/ContentResults"
import "./SearchResults.scss"

export default class MovieResultsAdvSearch extends React.PureComponent {
  render() {
    return (
      <>
        <ContentResults
          contentArr={this.props.advancedSearchContent}
          toggleContentArr={this.props.advancedSearchContent}
          advancedSearchContent={this.props.advancedSearchContent}
          clearAdvSearchMovies={this.props.clearAdvSearchMovies}
          contentType="adv-search"
        />
        {this.props.loadingNewPage && <Loader className="loader--new-page" />}
      </>
    )
  }
}
