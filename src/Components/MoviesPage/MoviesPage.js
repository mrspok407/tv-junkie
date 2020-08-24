import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import { withRouter } from "react-router-dom"
import { Helmet } from "react-helmet"
import Header from "../Header/Header"
import MoviesContent from "./MoviesContent"
import ScrollToTop from "Utils/ScrollToTop"
import Footer from "Components/Footer/Footer"

let cancelRequest

class Movies extends Component {
  constructor(props) {
    super(props)

    this.state = {
      moviesArr: [],
      error: [],
      loadingIds: [],
      moviesIds: [],
      showAllLinksPressed: false,
      showPixBtn: false
    }
  }

  componentWillUnmount() {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
  }

  getMovieLinks = (id, showAllLinksPressed = false) => {
    if (this.state.moviesIds.includes(id) || this.state.showAllLinksPressed) return

    this.setState(prevState => ({
      loadingIds: [...prevState.loadingIds, id],
      moviesIds: [...prevState.moviesIds, id],
      showAllLinksPressed
    }))

    axios
      .get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US&append_to_response=similar_movies,external_ids`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
      .then(({ data: { external_ids } }) => {
        const imdbId = external_ids.imdb_id
        return axios.get(`https://yts.mx/api/v2/list_movies.json?query_term=${imdbId}`, {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        })
      })
      .then(res => {
        const movie = res.data.data.movies[0]
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

  togglePixBtn = () => {
    this.setState({
      showPixBtn: !this.state.showPixBtn
    })
  }

  render() {
    return (
      <>
        <Helmet>
          <title>All your movies | TV Junkie</title>
        </Helmet>
        <Header />
        <button
          style={{ width: `250px`, margin: "0px" }}
          className="button"
          onClick={() => this.togglePixBtn()}
        >
          Toggle Pix Btn
        </button>
        {this.state.showPixBtn && <div id="pixiboTest"></div>}
        <MoviesContent
          moviesArr={this.state.moviesArr}
          getMovieLinks={this.getMovieLinks}
          loadingIds={this.state.loadingIds}
          moviesIds={this.state.moviesIds}
          showAllLinksPressed={this.state.showAllLinksPressed}
          error={this.state.error}
        />
        <Footer />
        <ScrollToTop />
      </>
    )
  }
}

export default withRouter(Movies)
