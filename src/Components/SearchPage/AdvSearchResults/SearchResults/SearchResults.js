import React from "react"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import { compose } from "recompose"
import Loader from "Components/Placeholders/Loader"
import ContentResults from "Components/Templates/ContentResults/ContentResults"
import "./SearchResults.scss"
import { withSelectedContextConsumer } from "Components/SelectedContentContext"

class MovieResultsAdvSearch extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      // watchingTvShows: []
    }
  }

  componentDidMount() {
    // const firebase = this.props.firebase
    // firebase.auth.onAuthStateChanged(authUser => {
    //   firebase.userWatchingTvShows(authUser.uid).on("value", snapshot => {
    //     const watchingTvShows = snapshot.val() || {}
    //     const watchingTvShowsList = Object.keys(watchingTvShows).map(key => ({
    //       ...watchingTvShows[key],
    //       uid: key
    //     }))
    //     this.setState({
    //       watchingTvShows: watchingTvShowsList
    //     })
    //   })
    // })
  }

  componentWillUnmount() {
    // this.props.firebase.auth.onAuthStateChanged(authUser => {
    //   this.props.firebase.userWatchingTvShows(authUser.uid).off()
    // })
  }

  render() {
    return (
      <>
        <ContentResults
          contentArr={this.props.advancedSearchContent}
          watchingTvShows={this.props.watchingTvShows}
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

export default compose(withSelectedContextConsumer)(MovieResultsAdvSearch)
