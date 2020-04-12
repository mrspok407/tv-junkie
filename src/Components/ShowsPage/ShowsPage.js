import React, { Component } from "react"
import axios from "axios"
import ContentResults from "../Templates/ContentResults/ContentResults"
import PlaceholderNoSelectedContent from "../Placeholders/PlaceholderNoSelectedContent"
import { SelectedContentContext } from "../Context/SelectedContentContext"
import ScrollToTop from "../../Utils/ScrollToTop"
import { API_KEY } from "../../Utils"
import "./ShowsPage.scss"

// https://cors-anywhere.herokuapp.com/torrentapi.org/pubapi_v2.php?app_id=pet-project&format=json_extended&mode=search&category=41&search_string=better+call+saul+s05e08&sort=seeders&token=2aehol3kw0

export default class Shows extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showsArr: [],
      error: "",
      loadingIds: [],
      detailedInfoShows: []
    }
  }

  getEpisodeInfo = id => {
    if (this.state.loadingIds.includes(id)) return

    this.setState(prevState => ({
      loadingIds: [...prevState.loadingIds, id],
      detailedInfoShows: [...prevState.detailedInfoShows, id]
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
      .catch(err => {
        this.setState({
          error: err || "Error occured"
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
          <div className="content-results">
            <ContentResults
              contentType="shows"
              contentArr={onlyShows}
              toggleContentArr={onlyShows}
              className="content-results__wrapper--shows-page"
              getEpisodeInfo={this.getEpisodeInfo}
              requestedShowId={this.state.requestedShowId}
              showsArr={this.state.showsArr}
              loadingIds={this.state.loadingIds}
              detailedInfoShows={this.state.detailedInfoShows}
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

Shows.contextType = SelectedContentContext
