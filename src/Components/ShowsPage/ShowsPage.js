import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import ContentResults from "Components/Templates/ContentResults/ContentResults"
import PlaceholderNoSelectedContent from "Components/Placeholders/PlaceholderNoSelectedContent"
import { withSelectedContextConsumer } from "Components/SelectedContentContext"
import ScrollToTop from "Utils/ScrollToTop"
import "./ShowsPage.scss"
import HeaderBase from "Components/Header/Header"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import { compose } from "recompose"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"

let cancelRequest

const Header = withFirebase(HeaderBase)

class Shows extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showsArr: [],
      loadingIds: [],
      showsIds: [],
      showAllLinksPressed: false,
      error: "",
      watchingTvShows: []
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
    // this.props.selectedContentState.getContent()
  }

  componentWillUnmount() {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }

    // this.props.selectedContentState.unmountFirebaseListener(this.props.authUser)

    // this.props.firebase.userWatchingTvShows(this.props.authUser.uid).off()
  }

  getLastEpisodeLinks = (id, showAllLinksPressed) => {
    if (this.state.showsIds.includes(id) || this.state.showAllLinksPressed) return

    this.setState(prevState => ({
      loadingIds: [...prevState.loadingIds, id],
      showsIds: [...prevState.showsIds, id],
      showAllLinksPressed
    }))

    axios
      .get(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`, {
        cancelToken: new CancelToken(function executor(c) {
          cancelRequest = c
        })
      })
      .then(res => {
        const tvShow = res.data
        this.setState(prevState => ({
          showsArr: [...prevState.showsArr, tvShow],
          loadingIds: [...prevState.loadingIds.filter(item => item !== id)]
        }))
      })
      .catch(err => {
        if (axios.isCancel(err)) return
        this.setState({
          error: "Something went wrong, sorry"
        })
      })
  }

  render() {
    console.log(this.props.droppedTvShows)
    // const onlyShows = this.props.selectedContentState.selectedContent.filter(item => item.original_name)
    // const onlyShows = this.state.watchingTvShows
    return (
      <>
        <Header />
        {this.props.watchingTvShows.length ? (
          <ContentResults
            contentType="shows"
            // contentArr={this.state.watchingTvShows}
            contentArr={this.props.watchingTvShows}
            // watchingTvShows={this.state.watchingTvShows}
            watchingTvShows={this.props.watchingTvShows}
            getLastEpisodeLinks={this.getLastEpisodeLinks}
            showsArr={this.state.showsArr}
            loadingIds={this.state.loadingIds}
            showsIds={this.state.showsIds}
            error={this.state.error}
            className="content-results__wrapper--shows-page"
          />
        ) : (
          <PlaceholderNoSelectedContent />
        )}
        <ScrollToTop />
      </>
    )
  }
}

export default compose(withSelectedContextConsumer)(Shows)
