import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import ContentResults from "../Templates/ContentResults/ContentResults"
import PlaceholderNoSelectedContent from "../Placeholders/PlaceholderNoSelectedContent"
import { SelectedContentContext } from "../Context/SelectedContentContext"
import ScrollToTop from "../../Utils/ScrollToTop"
import "./ShowsPage.scss"
import HeaderBase from "../Header/Header"
import { withFirebase } from "../Firebase/FirebaseContext"

let cancelRequest

const Header = withFirebase(HeaderBase)

export default class Shows extends Component {
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
      .get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
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
    const onlyShows = this.context.selectedContent.filter(item => item.original_name)
    return (
      <>
        <Header />
        {onlyShows.length ? (
          <ContentResults
            contentType="shows"
            contentArr={onlyShows}
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

Shows.contextType = SelectedContentContext
