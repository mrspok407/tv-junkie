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

const API_KEY = "c5e3186413780c3aeec39b0767a6ec99"

const LOCAL_STORAGE_KEY = "selectedMovies"
const LOCAL_STORAGE_KEY_ADV = "advancedSearchMovies"
const LOCAL_STORAGE_KEY_ACTORS = "addedActors"

const currentYear = new Date().getFullYear()

let cancelRequest

export default class MainPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [],
      advancedSearchMovies:
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ADV)) || [],
      withActors:
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ACTORS)) || [],
      totalPagesAdvMovies: null,
      searchingMovie: false,
      // searchingRandomMovies: false,
      searchingAdvancedSearch: false,
      error: "",
      showScrollToTop: false
    }
  }

  componentDidMount() {
    document.addEventListener(
      "scroll",
      debounce(() => this.toggleShowToTop(), 50)
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

  randomMovies = () => {
    if (cancelRequest !== undefined) {
      cancelRequest()
    }

    const selectedMovies = [...this.state.selectedMovies]

    this.setState({ searchingRandomMovies: true })

    const randomPage = Math.ceil(Math.random() * 45)

    axios
      .get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&include_adult=false&\n
    include_video=false&page=${randomPage}&primary_release_date.gte=2000-01-01&vote_count.gte=2000&vote_average.gte=6`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
      .then(res => {
        const randomMovies = res.data.results.splice(0, 10)
        this.setState({
          selectedMovies: randomMovies,
          searchingRandomMovies: false
        })
      })
      .catch(err => {
        if (axios.isCancel(err)) return
        this.setState({
          selectedMovies,
          searchingRandomMovies: false
        })
      })
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
    if (cancelRequest !== undefined) {
      cancelRequest()
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

    axios
      .get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US\
&include_adult=false&include_video=true&page=1&primary_release_year=${year}&\
primary_release_date.gte=${yearRange.start}&primary_release_date.lte=${yearRange.finish}\
&with_genres=${getWithGenres}&without_genres=${getWithoutGenres}&vote_average.gte=${rating}&\
vote_count.gte=${voteCountMoreThan}&sort_by=${sortBy}&with_people=${getActors}`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
      .then(({ data: { results: movies, total_pages: totalPages } }) => {
        this.setState({
          advancedSearchMovies: movies,
          searchingAdvancedSearch: false,
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
        clearAdvSearchMovies={this.clearAdvSearchMovies}
      />
    )
  }

  toggleShowToTop = () => {
    this.setState({
      showScrollToTop: window.pageYOffset > 600
    })
  }

  toggleScrollToTop = () => {
    window.scrollTo({
      top: 0
    })
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

        {this.state.showScrollToTop && (
          <div className="scroll-top">
            <button type="button" onClick={() => this.toggleScrollToTop()} />
          </div>
        )}

        <Footer />
      </>
    )
  }
}
