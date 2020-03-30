import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import debounce from "debounce"
import MovieSearch from "./MovieSearch/MovieSearch"
import MovieResultsAdvSearch from "./MovieResults/MovieResultsAdvSearch/MovieResultsAdvSearch"
import MovieResultsSelected from "./MovieResults/MovieResultsSelected/MovieResultsSelected"
import "./MovieResults/MovieResults.scss"
import PlaceholderNoResults from "./Placeholders/PlaceholderNoResults"
import Header from "../Header/Header"
import Footer from "../Footer/Footer"
import ScrollToTop from "../../Utils/ScrollToTop"

const API_KEY = "c5e3186413780c3aeec39b0767a6ec99"

const LOCAL_STORAGE_KEY = "selectedMovies"
const LOCAL_STORAGE_KEY_ADV = "advancedSearchMovies"
const LOCAL_STORAGE_KEY_ACTORS = "addedActors"
const LOCAL_STORAGE_KEY_INPUTS = "advSearchInputs"
const LOCAL_STORAGE_KEY_PAGENUMBER = "pageNumber"
const LOCAL_STORAGE_KEY_TOTALPAGES = "totalPages"

const currentYear = new Date().getFullYear()

// let cancelRequestAdvSearch
let cancelRequestMovies
let cancelRequestTvShows

export default class MainPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [],
      advancedSearchMovies:
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ADV)) || [],
      numOfPagesLoaded:
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_PAGENUMBER)) || 0,
      advSearchInputValues:
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_INPUTS)) || {},
      withActors:
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ACTORS)) || [],
      totalPagesAdvMovies:
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_TOTALPAGES)) || null,
      searchingMovie: false,
      searchingAdvancedSearch: false,
      loadingNewPage: false,
      error: ""
    }
  }

  componentDidMount() {
    document.addEventListener(
      "scroll",
      debounce(() => this.loadNewPage(), 100)
    )
  }

  componentDidUpdate() {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(this.state.selectedMovies)
    )
    localStorage.setItem(
      LOCAL_STORAGE_KEY_ADV,
      JSON.stringify(this.state.advancedSearchMovies)
    )
    localStorage.setItem(
      LOCAL_STORAGE_KEY_ACTORS,
      JSON.stringify(this.state.withActors)
    )
    localStorage.setItem(
      LOCAL_STORAGE_KEY_INPUTS,
      JSON.stringify(this.state.advSearchInputValues)
    )
    localStorage.setItem(
      LOCAL_STORAGE_KEY_PAGENUMBER,
      JSON.stringify(this.state.numOfPagesLoaded)
    )
    localStorage.setItem(
      LOCAL_STORAGE_KEY_TOTALPAGES,
      JSON.stringify(this.state.totalPagesAdvMovies)
    )
  }

  toggleMovie = (id, movieArr) => {
    const newSelectedMovies = [...this.state.selectedMovies]
    const indexInSelected = newSelectedMovies.findIndex(e => e.id === id)

    if (indexInSelected !== -1) {
      newSelectedMovies.splice(indexInSelected, 1)
      this.setState({
        selectedMovies: newSelectedMovies
      })
    } else {
      const indexInAdvanced = movieArr.findIndex(e => e.id === id)
      const movie = movieArr[indexInAdvanced]
      this.setState({
        selectedMovies: [movie, ...newSelectedMovies]
      })
    }
  }

  advancedSearch = (
    year,
    decade,
    yearFrom,
    yearTo,
    rating,
    voteCount,
    sortBy,
    withActors,
    genres
  ) => {
    if (
      cancelRequestMovies !== undefined ||
      cancelRequestTvShows !== undefined
    ) {
      // cancelRequestAdvSearch()
      cancelRequestMovies()
      cancelRequestTvShows()
    }

    this.setState({
      searchingAdvancedSearch: true
    })

    const { advancedSearchMovies } = this.state

    const toYear = yearTo || currentYear
    const fromYear = yearFrom || "1900"
    const yearRange =
      (decade === "" && yearFrom === "" && yearTo === "") || year !== ""
        ? {
            start: "",
            finish: ""
          }
        : decade !== ""
        ? {
            start: `${decade}-01-01`,
            finish: `${parseInt(decade, 10) + 9}-12-31`
          }
        : {
            start: `${fromYear}-01-01`,
            finish: `${parseInt(toYear, 10)}-12-31`
          }

    const getWithGenres = genres
      .filter(item => item.withGenre)
      .map(item => item.id.toString())
      .join()

    const getWithoutGenres = genres
      .filter(item => item.withoutGenre)
      .map(item => item.id.toString())
      .join()

    const getActors = withActors.map(item => item.id).join()

    const voteCountMoreThan =
      parseInt(voteCount, 10) <= 100 || voteCount === "" ? "25" : voteCount

    const sortTvDate =
      sortBy === "primary_release_date.desc" ? "first_air_date.desc" : sortBy

    this.setState({
      advSearchInputValues: {
        year,
        yearRangeStart: yearRange.start,
        yearRangeFinish: yearRange.finish,
        getWithGenres,
        getWithoutGenres,
        rating,
        voteCountMoreThan,
        sortBy,
        getActors
      }
    })

    const getMovies = axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US\
&include_adult=false&include_video=true&page=1&primary_release_year=${year}&\
primary_release_date.gte=${yearRange.start}&primary_release_date.lte=${yearRange.finish}\
&with_genres=${getWithGenres}&without_genres=${getWithoutGenres}&vote_average.gte=${rating}&\
vote_count.gte=${voteCountMoreThan}&sort_by=${sortBy}&with_people=${getActors}`,
      {
        cancelToken: new CancelToken(function executor(c) {
          cancelRequestMovies = c
        })
      }
    )
    const getTvShows = axios.get(
      `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}\
&language=en-US&page=1&sort_by=${sortTvDate}&first_air_date.gte=${yearRange.start}&first_air_date.lte=${yearRange.finish}\
&first_air_date_year=${year}&vote_average.gte=${rating}&vote_count.gte=${voteCountMoreThan}&include_null_first_air_dates=false\
&with_genres=${getWithGenres}&without_genres=${getWithoutGenres}`,
      {
        cancelToken: new CancelToken(function executor(c) {
          cancelRequestTvShows = c
        })
      }
    )

    axios
      .all([getMovies, getTvShows])
      .then(
        axios.spread((...responses) => {
          const movies = responses[0].data
          const tvShows = responses[1].data
          const totalPages = movies.total_pages + tvShows.total_pages

          // const sort =
          //   sortBy === "primary_release_date.desc"
          //     ? "release_date"
          //     : sortBy.slice(0, -5)

          // const getDate = ({ release_date, first_air_date }) =>
          //   release_date || first_air_date

          const moviesAndTvShows = [...movies.results, ...tvShows.results].sort(
            (a, b) => {
              const sortedA =
                sortBy === "primary_release_date.desc"
                  ? a.release_date || a.first_air_date
                  : a[sortBy.slice(0, -5)]
              const sortedB =
                sortBy === "primary_release_date.desc"
                  ? b.release_date || b.first_air_date
                  : b[sortBy.slice(0, -5)]
              // const getDate = ({ release_date, first_air_date }) =>
              //   release_date || first_air_date

              if (sortedA > sortedB) {
                return -1
              }
              return 1
            }
          )

          this.setState({
            advancedSearchMovies: moviesAndTvShows,
            searchingAdvancedSearch: false,
            numOfPagesLoaded: 1,
            totalPagesAdvMovies: totalPages
          })
        })
      )

      //     axios
      //       .get(
      //         `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US\
      // &include_adult=false&include_video=true&page=1&primary_release_year=${year}&\
      // primary_release_date.gte=${yearRange.start}&primary_release_date.lte=${yearRange.finish}\
      // &with_genres=${getWithGenres}&without_genres=${getWithoutGenres}&vote_average.gte=${rating}&\
      // vote_count.gte=${voteCountMoreThan}&sort_by=${sortBy}&with_people=${getActors}`,
      //         {
      //           cancelToken: new CancelToken(function executor(c) {
      //             cancelRequestAdvSearch = c
      //           })
      //         }
      //       )
      // .then(({ data: { results: movies, total_pages: totalPages } }) => {
      // this.setState({
      //   advancedSearchMovies: movies,
      //   searchingAdvancedSearch: false,
      //   numOfPagesLoaded: 1,
      //   totalPagesAdvMovies: totalPages
      // })
      // })
      .catch(err => {
        if (axios.isCancel(err)) return
        this.setState({
          advancedSearchMovies: [...advancedSearchMovies],
          searchingAdvancedSearch: false
        })
      })
  }

  loadNewPage = () => {
    // if (cancelRequestNewPage !== undefined) {
    //   cancelRequestNewPage()
    // }

    if (this.state.loadingNewPage) return

    if (
      this.state.advancedSearchMovies.length < 20 ||
      this.state.totalPagesAdvMovies <= this.state.numOfPagesLoaded
    )
      return

    if (
      window.innerHeight + window.scrollY >=
      document.body.scrollHeight - 650
    ) {
      this.setState({
        loadingNewPage: true
      })

      const {
        year,
        yearRangeStart,
        yearRangeFinish,
        getWithGenres,
        getWithoutGenres,
        rating,
        voteCountMoreThan,
        sortBy,
        getActors
      } = this.state.advSearchInputValues

      const pageNum = this.state.numOfPagesLoaded + 1

      const { advancedSearchMovies } = this.state

      axios
        .get(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US\
&include_adult=false&include_video=true&page=${pageNum}&primary_release_year=${year}&\
primary_release_date.gte=${yearRangeStart}&primary_release_date.lte=${yearRangeFinish}\
&with_genres=${getWithGenres}&without_genres=${getWithoutGenres}&vote_average.gte=${rating}&\
vote_count.gte=${voteCountMoreThan}&sort_by=${sortBy}&with_people=${getActors}`
          // {
          //   cancelToken: new CancelToken(function executor(c) {
          //     cancelRequestNewPage = c
          //   })
          // }
        )
        .then(({ data: { results: movies, total_pages: totalPages } }) => {
          this.setState({
            advancedSearchMovies: [...advancedSearchMovies, ...movies],
            numOfPagesLoaded: pageNum,
            totalPagesAdvMovies: totalPages,
            loadingNewPage: false
          })
          console.log(this.state.advancedSearchMovies)
        })
        .catch(err => {
          if (axios.isCancel(err)) return
          this.setState({
            advancedSearchMovies: [...advancedSearchMovies],
            loadingNewPage: false
          })
        })
    }
  }

  clearSelectedMovies = () => {
    this.setState({ selectedMovies: [] })
  }

  clearAdvSearchMovies = () => {
    this.setState({ advancedSearchMovies: [] })
  }

  clearWithActors = () => {
    this.setState({ withActors: [] })
  }

  toggleActor = (id, name) => {
    const actorsArr = [...this.state.withActors]
    const indexInActors = actorsArr.findIndex(e => e.id === id)
    if (indexInActors !== -1) {
      actorsArr.splice(indexInActors, 1)
      this.setState({
        withActors: actorsArr
      })
    } else {
      this.setState({
        withActors: [
          {
            name,
            id
          },
          ...actorsArr
        ]
      })
    }
  }

  renderAdvMovies = () => {
    const { advancedSearchMovies, totalPagesAdvMovies } = this.state
    return !Array.isArray(advancedSearchMovies) || totalPagesAdvMovies === 0 ? (
      <PlaceholderNoResults
        message="No movies found"
        className="placeholder--no-results__adv-movies"
      />
    ) : (
      <MovieResultsAdvSearch
        selectedMovies={this.state.selectedMovies}
        toggleMovie={this.toggleMovie}
        advancedSearchMovies={this.state.advancedSearchMovies}
        searchingAdvancedSearch={this.state.searchingAdvancedSearch}
        loadingNewPage={this.state.loadingNewPage}
        clearAdvSearchMovies={this.clearAdvSearchMovies}
      />
    )
  }

  render() {
    return (
      <>
        <Header />
        <MovieSearch
          handleClickOutside={this.handleClickOutside}
          onSearch={this.handleSearch}
          selectedMovies={this.state.selectedMovies}
          searchingAdvancedSearch={this.state.searchingAdvancedSearch}
          toggleMovie={this.toggleMovie}
          toggleActor={this.toggleActor}
          withActors={this.state.withActors}
          renderMovies={this.renderMovies}
          randomMovies={this.randomMovies}
          advancedSearch={this.advancedSearch}
          clearWithActors={this.clearWithActors}
          API_KEY={API_KEY}
        />
        <div className="movie-results-cont">{this.renderAdvMovies()}</div>
        {this.state.selectedMovies.length > 0 && (
          <MovieResultsSelected
            selectedMovies={this.state.selectedMovies}
            searchingRandomMovies={this.state.searchingRandomMovies}
            toggleMovie={this.toggleMovie}
            clearSelectedMovies={this.clearSelectedMovies}
          />
        )}
        <ScrollToTop />
        <Footer />
      </>
    )
  }
}
