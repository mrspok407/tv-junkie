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

let cancelRequestAdvSearch

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
    if (cancelRequestAdvSearch !== undefined) {
      cancelRequestAdvSearch()
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

    axios
      .get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US\
&include_adult=false&include_video=true&page=1&primary_release_year=${year}&\
primary_release_date.gte=${yearRange.start}&primary_release_date.lte=${yearRange.finish}\
&with_genres=${getWithGenres}&without_genres=${getWithoutGenres}&vote_average.gte=${rating}&\
vote_count.gte=${voteCountMoreThan}&sort_by=${sortBy}&with_people=${getActors}`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequestAdvSearch = c
          })
        }
      )
      .then(({ data: { results: movies, total_pages: totalPages } }) => {
        this.setState({
          advancedSearchMovies: movies,
          searchingAdvancedSearch: false,
          numOfPagesLoaded: 1,
          totalPagesAdvMovies: totalPages
        })
      })
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
