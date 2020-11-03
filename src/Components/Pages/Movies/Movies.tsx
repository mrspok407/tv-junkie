import React, { Component } from "react"
import axios from "axios"
import { Helmet } from "react-helmet"
import Header from "Components/UI/Header/Header"
import MoviesContent from "./MoviesContent"
import ScrollToTop from "Utils/ScrollToTopBar"
import Footer from "Components/UI/Footer/Footer"
import { withRouter } from "react-router-dom"
const { CancelToken } = require("axios")

let cancelRequest: any

type State = {
  moviesArr: { torrents: {}[]; title: string }[]
  error: number[]
  loadingIds: number[]
  moviesIds: number[]
}

interface getMovieLinksArg {
  id: number
}

class Movies extends Component<State> {
  state: State = {
    moviesArr: [],
    error: [],
    loadingIds: [],
    moviesIds: []
  }

  componentWillUnmount() {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
  }

  getMovieLinks = ({ id }: getMovieLinksArg) => {
    if (this.state.moviesIds.includes(id)) return

    this.setState((prevState: { loadingIds: number[]; moviesIds: number[] }) => ({
      loadingIds: [...prevState.loadingIds, id],
      moviesIds: [...prevState.moviesIds, id]
    }))

    axios
      .get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US&append_to_response=similar_movies,external_ids`,
        {
          cancelToken: new CancelToken(function executor(c: any) {
            cancelRequest = c
          })
        }
      )
      .then(({ data: { external_ids } }) => {
        const imdbId = external_ids.imdb_id
        return axios.get(`https://yts.mx/api/v2/list_movies.json?query_term=${imdbId}`, {
          cancelToken: new CancelToken(function executor(c: any) {
            cancelRequest = c
          })
        })
      })
      .then((res) => {
        const movie = res.data.data.movies[0]
        movie.id = id
        this.setState((prevState: { loadingIds: number[]; moviesArr: {}[] }) => ({
          moviesArr: [...prevState.moviesArr, movie],
          loadingIds: [...prevState.loadingIds.filter((item: number) => item !== id)]
        }))
      })
      .catch((error) => {
        if (axios.isCancel(error)) return
        this.setState((prevState: { error: number[] }) => ({
          error: [...prevState.error, id]
        }))
      })
  }

  render() {
    return (
      <>
        <Helmet>
          <title>All your movies | TV Junkie</title>
        </Helmet>
        <Header />
        <MoviesContent
          moviesArr={this.state.moviesArr}
          getMovieLinks={this.getMovieLinks}
          loadingIds={this.state.loadingIds}
          moviesIds={this.state.moviesIds}
          error={this.state.error}
        />
        <Footer />
        <ScrollToTop />
      </>
    )
  }
}

// @ts-ignore
export default withRouter(Movies)
