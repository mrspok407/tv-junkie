import React from "react"
import { compose } from "recompose"
import Loader from "Components/Placeholders/Loader"
import ContentResults from "Components/Templates/ContentResults/ContentResults"
import "./SearchResults.scss"
import { withUserContent } from "Components/UserContent"

class MovieResultsAdvSearch extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      // watchingShows: []
    }
  }

  componentDidMount() {
    // const firebase = this.props.firebase
    // firebase.auth.onAuthStateChanged(authUser => {
    //   firebase.watchingShows(authUser.uid).on("value", snapshot => {
    //     const watchingShows = snapshot.val() || {}
    //     const watchingTvShowsList = Object.keys(watchingShows).map(key => ({
    //       ...watchingShows[key],
    //       uid: key
    //     }))
    //     this.setState({
    //       watchingShows: watchingTvShowsList
    //     })
    //   })
    // })
  }

  componentWillUnmount() {
    // this.props.firebase.auth.onAuthStateChanged(authUser => {
    //   this.props.firebase.watchingShows(authUser.uid).off()
    // })
  }

  render() {
    return (
      <>
        <ContentResults
          contentArr={this.props.advancedSearchContent}
          watchingShows={this.props.userContent.watchingShows}
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

export default compose(withUserContent)(MovieResultsAdvSearch)
