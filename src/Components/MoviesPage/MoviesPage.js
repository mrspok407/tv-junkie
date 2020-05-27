import React, { Component } from "react"
import axios, { CancelToken } from "axios"
// import ContentResults from "Components/Templates/ContentResults/ContentResults"
// import PlaceholderNoSelectedContent from "Components/Placeholders/PlaceholderNoSelectedContent"
import ScrollToTop from "Utils/ScrollToTop"
import "./MoviesPage.scss"
import Header from "../Header/Header"
import MoviesContent from "./MoviesContent"

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
    return (
      <>
        <Header />
        <MoviesContent
          moviesArr={this.state.moviesArr}
          getMovieLinks={this.getMovieLinks}
          loadingIds={this.state.loadingIds}
          moviesIds={this.state.moviesIds}
          showAllLinksPressed={this.state.showAllLinksPressed}
          error={this.state.error}
        />
        {/* {onlyMovies.length ? (
          <ContentResults
            contentType="movies"
            contentArr={watchLaterMovies}
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
        )} */}
        <ScrollToTop />
      </>
    )
  }
}

export default Movies
