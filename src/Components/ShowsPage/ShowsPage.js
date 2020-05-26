import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import ContentResults from "Components/Templates/ContentResults/ContentResults"
import PlaceholderNoSelectedContent from "Components/Placeholders/PlaceholderNoSelectedContent"
import { withUserContent } from "Components/UserContent"
import ScrollToTop from "Utils/ScrollToTop"
import "./ShowsPage.scss"
import HeaderBase from "Components/Header/Header"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import { compose } from "recompose"

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
      error: ""
    }
  }

  componentWillUnmount() {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
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
    const watchingShows = this.props.userContent.watchingShows.filter(item => item.userWatching && item)
    return (
      <>
        <Header />
        {watchingShows.length ? (
          <ContentResults
            contentType="shows"
            contentArr={watchingShows}
            watchingShows={watchingShows}
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

export default compose(withUserContent)(Shows)
