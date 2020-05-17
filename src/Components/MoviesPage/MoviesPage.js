import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import ContentResults from "Components/Templates/ContentResults/ContentResults"
import PlaceholderNoSelectedContent from "Components/Placeholders/PlaceholderNoSelectedContent"
import { withSelectedContextConsumer } from "Components/SelectedContentContext"
import ScrollToTop from "Utils/ScrollToTop"
import "./MoviesPage.scss"
import Header from "../Header/Header"

let cancelRequest

class Movies extends Component {
  constructor(props) {
    super(props)

    this.state = {
      moviesArr: [],
      error: [],
      loadingIds: [],
      moviesIds: [],
      showAllLinksPressed: false
    }
  }

  componentWillUnmount() {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
  }

  getMovieLinks = (id, showAllLinksPressed = false, title, date) => {
    if (this.state.moviesIds.includes(id) || this.state.showAllLinksPressed) return

    this.setState(prevState => ({
      loadingIds: [...prevState.loadingIds, id],
      moviesIds: [...prevState.moviesIds, id],
      showAllLinksPressed
    }))

    axios
      .get(`https://yts.mx/api/v2/list_movies.json?query_term=${title}`, {
        cancelToken: new CancelToken(function executor(c) {
          cancelRequest = c
        })
      })
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
        if (axios.isCancel(err)) return
        this.setState(prevState => ({
          error: [...prevState.error, id]
        }))
      })
  }

  render() {
    const onlyMovies = this.props.selectedContentState.selectedContent.filter(
      item => item.original_title
    )
    return (
      <>
        <Header />
        {onlyMovies.length ? (
          <ContentResults
            contentType="movies"
            contentArr={onlyMovies}
            moviesArr={this.state.moviesArr}
            loadingIds={this.state.loadingIds}
            moviesIds={this.state.moviesIds}
            getMovieLinks={this.getMovieLinks}
            showAllLinksPressed={this.state.showAllLinksPressed}
            error={this.state.error}
            className="content-results__wrapper--movies-page"
          />
        ) : (
          <PlaceholderNoSelectedContent />
        )}
        <ScrollToTop />
      </>
    )
  }
}

export default withSelectedContextConsumer(Movies)
