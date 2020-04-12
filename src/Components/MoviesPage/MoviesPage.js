import React, { Component } from "react"
import axios from "axios"
import ContentResults from "../Templates/ContentResults/ContentResults"
import PlaceholderNoSelectedContent from "../Placeholders/PlaceholderNoSelectedContent"
import { SelectedContentContext } from "../Context/SelectedContentContext"
import ScrollToTop from "../../Utils/ScrollToTop"
import "./MoviesPage.scss"

export default class Movies extends Component {
  constructor(props) {
    super(props)

    this.state = {
      moviesArr: [],
      error: "",
      loadingIds: [],
      detailedInfoMovies: []
    }
  }

  getEpisodeInfo = (id, title, date) => {
    if (this.state.loadingIds.includes(id)) return

    this.setState(prevState => ({
      loadingIds: [...prevState.loadingIds, id],
      detailedInfoMovies: [...prevState.detailedInfoMovies, id]
    }))

    axios
      .get(`https://yts.mx/api/v2/list_movies.json?query_term=${title}`)
      .then(res => {
        const year = Number(date.slice(0, 4))
        const movie = res.data.data.movies.find(item => item.year === year)
        movie.id = id
        this.setState(prevState => ({
          moviesArr: [...prevState.moviesArr, movie],
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
    const onlyMovies = this.context.selectedContent.filter(
      item => item.original_title
    )
    return (
      <>
        {onlyMovies.length ? (
          <div className="content-results">
            <ContentResults
              contentType="movies"
              contentArr={onlyMovies}
              toggleContentArr={onlyMovies}
              moviesArr={this.state.moviesArr}
              loadingIds={this.state.loadingIds}
              detailedInfoMovies={this.state.detailedInfoMovies}
              getEpisodeInfo={this.getEpisodeInfo}
              className="content-results__wrapper--movies-page"
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

Movies.contextType = SelectedContentContext
