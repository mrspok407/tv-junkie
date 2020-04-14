import React, { Component } from "react"
import axios from "axios"
import ContentResults from "../Templates/ContentResults/ContentResults"
import PlaceholderNoSelectedContent from "../Placeholders/PlaceholderNoSelectedContent"
import { SelectedContentContext } from "../Context/SelectedContentContext"
import ScrollToTop from "../../Utils/ScrollToTop"
import { API_KEY } from "../../Utils"
import "./ShowsPage.scss"

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

  getEpisodeInfo = (id, showAllLinksPressed) => {
    if (this.state.showsIds.includes(id) || this.state.showAllLinksPressed)
      return

    this.setState(prevState => ({
      loadingIds: [...prevState.loadingIds, id],
      showsIds: [...prevState.showsIds, id],
      showAllLinksPressed
    }))

    axios
      .get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`
      )
      .then(res => {
        const tvShow = res.data
        this.setState(prevState => ({
          showsArr: [...prevState.showsArr, tvShow],
          loadingIds: [...prevState.loadingIds.filter(item => item !== id)]
        }))
      })
      .catch(() => {
        this.setState({
          error: "Something went wrong, sorry"
        })
      })
  }

  render() {
    const onlyShows = this.context.selectedContent.filter(
      item => item.original_name
    )
    return (
      <>
        {onlyShows.length ? (
          <ContentResults
            contentType="shows"
            contentArr={onlyShows}
            toggleContentArr={onlyShows}
            getEpisodeInfo={this.getEpisodeInfo}
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
