import React, { Component } from "react"
import axios from "axios"
import ContentResults from "../Templates/ContentResults/ContentResults"
import PlaceholderNoSelectedContent from "../Placeholders/PlaceholderNoSelectedContent"
import { SelectedContentContext } from "../Context/SelectedContentContext"
import ScrollToTop from "../../Utils/ScrollToTop"
import { API_KEY } from "../../Utils"

export default class Shows extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showsArr: [],
      lastEpisodeNum: null,
      lastSeasonNum: null,
      tvShowName: "",
      error: ""
    }
  }

  getEpisodeInfo = id => {
    const updatedShowArr = this.state.showsArr

    if (updatedShowArr.some(e => e.id === id)) return

    axios
      .get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`
      )
      .then(res => {
        const tvShow = res.data
        this.setState({
          showsArr: [...updatedShowArr, tvShow],
          tvShowName: tvShow.name
        })

        console.log(this.state.showsArr)
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
              lastAirDate={this.state.lastAirDate}
              getEpisodeInfo={this.getEpisodeInfo}
              requestedShowId={this.state.requestedShowId}
              showsArr={this.state.showsArr}
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
