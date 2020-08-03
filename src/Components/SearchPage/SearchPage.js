import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import { throttle } from "throttle-debounce"
import Search from "./Search/Search"
import AdvancedSearch from "Components/SearchPage/Search/AdvancedSearch/AdvancedSearch"
import AdvSearchResults from "./AdvSearchResults/SearchResults/SearchResults"
import PlaceholderNoResults from "Components/Placeholders/PlaceholderNoResults"
import ScrollToTop from "Utils/ScrollToTop"
import Header from "Components/Header/Header"
import "./SearchPage.scss"

const LOCAL_STORAGE_KEY_ADV = "advancedSearchContent"
const LOCAL_STORAGE_KEY_ACTORS = "addedActors"
const LOCAL_STORAGE_KEY_INPUTS = "advSearchInputs"
const LOCAL_STORAGE_KEY_PAGENUMBER = "pageNumber"
const LOCAL_STORAGE_KEY_TOTALPAGES = "totalPages"

const currentYear = new Date().getFullYear()

let cancelRequestAdvSearch
class SearchPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      advancedSearchContent: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ADV)) || [],
      numOfPagesLoaded: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_PAGENUMBER)) || 1,
      advSearchInputValues: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_INPUTS)) || {},
      withActors: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ACTORS)) || [],
      totalPagesAdvMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_TOTALPAGES)) || null,
      searchingMovie: false,
      searchingAdvancedSearch: false,
      loadingNewPage: false,
      error: ""
    }
  }

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll)
  }

  componentWillUnmount() {
    if (cancelRequestAdvSearch !== undefined) {
      cancelRequestAdvSearch()
    }
    window.removeEventListener("scroll", this.handleScroll)
  }

  componentDidUpdate() {
    localStorage.setItem(LOCAL_STORAGE_KEY_ADV, JSON.stringify(this.state.advancedSearchContent))
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTORS, JSON.stringify(this.state.withActors))
    localStorage.setItem(LOCAL_STORAGE_KEY_INPUTS, JSON.stringify(this.state.advSearchInputValues))
    localStorage.setItem(LOCAL_STORAGE_KEY_PAGENUMBER, JSON.stringify(this.state.numOfPagesLoaded))
    localStorage.setItem(LOCAL_STORAGE_KEY_TOTALPAGES, JSON.stringify(this.state.totalPagesAdvMovies))
  }

  advancedSearch = (
    year,
    decade,
    yearFrom,
    yearTo,
    rating,
    voteCount,
    sortBy,
    mediaType,
    withActors,
    genres
  ) => {
    if (cancelRequestAdvSearch !== undefined) {
      cancelRequestAdvSearch()
    }

    this.setState({
      searchingAdvancedSearch: true,
      numOfPagesLoaded: 1
    })

    const { advancedSearchContent } = this.state

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
      .reduce((acc, item) => {
        if (item.withGenre) acc.push(item.id.toString())
        return acc
      }, [])
      .join()

    const getWithoutGenres = genres
      .reduce((acc, item) => {
        if (item.withoutGenre) acc.push(item.id.toString())
        return acc
      }, [])
      .join()

    const getActors = withActors.map(item => item.id).join()

    const voteCountMoreThan = parseInt(voteCount, 10) <= 100 || voteCount === "" ? "25" : voteCount

    const sortTvDate = sortBy === "primary_release_date.desc" ? "first_air_date.desc" : sortBy

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
        getActors,
        mediaType,
        sortTvDate
      }
    })

    // const sortMapping = {
    //   vote_count: "vote_count",
    //   vote_average: "vote_average",
    //   popularity: "popularity",
    //   primary_release_date: ["release_date", "first_air_date"]
    // }

    // const getSortField = (item, sortKey) => {
    //   const fieldAccessor = sortMapping[sortKey]
    //   return Array.isArray(fieldAccessor)
    //     ? fieldAccessor.reduce((acc, a) => item[a] || acc, 0)
    //     : item[fieldAccessor]
    // }

    const getMovies =
      mediaType === "movie" &&
      `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US\
&include_adult=false&include_video=true&page=${this.state.numOfPagesLoaded}&primary_release_year=${year}&\
primary_release_date.gte=${yearRange.start}&primary_release_date.lte=${yearRange.finish}\
&with_genres=${getWithGenres}&without_genres=${getWithoutGenres}&vote_average.gte=${rating}&\
vote_count.gte=${voteCountMoreThan}&sort_by=${sortBy}&with_people=${getActors}`

    const getTvShows =
      mediaType === "tv" &&
      `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.REACT_APP_TMDB_API}\
&language=en-US&page=${this.state.numOfPagesLoaded}&sort_by=${sortTvDate}&first_air_date.gte=${yearRange.start}&first_air_date.lte=${yearRange.finish}\
&first_air_date_year=${year}&vote_average.gte=${rating}&vote_count.gte=${voteCountMoreThan}&include_null_first_air_dates=false\
&with_genres=${getWithGenres}&without_genres=${getWithoutGenres}`

    axios
      .get(getMovies || getTvShows, {
        cancelToken: new CancelToken(function executor(c) {
          cancelRequestAdvSearch = c
        })
      })
      .then(({ data: { results: movies, total_pages: totalPages } }) => {
        this.setState({
          advancedSearchContent: movies,
          advSearchNoResults: movies.length === 0,
          searchingAdvancedSearch: false,
          numOfPagesLoaded: 1,
          totalPagesAdvMovies: totalPages
        })
      })
      .catch(err => {
        if (axios.isCancel(err)) return
        this.setState({
          advancedSearchContent: [...advancedSearchContent],
          searchingAdvancedSearch: false
        })
      })
  }

  loadMorePages = (getMovies, getTvShows, advancedSearchContent, pageNum) => {
    this.setState({
      loadingNewPage: true
    })

    axios
      .get(getMovies || getTvShows, {
        cancelToken: new CancelToken(function executor(c) {
          cancelRequestAdvSearch = c
        })
      })
      .then(({ data: { results: movies, total_pages: totalPages } }) => {
        this.setState({
          advancedSearchContent: [...advancedSearchContent, ...movies],
          numOfPagesLoaded: pageNum,
          totalPagesAdvMovies: totalPages,
          loadingNewPage: false
        })
      })
      .catch(err => {
        if (axios.isCancel(err)) return
        this.setState({
          advancedSearchContent: [...advancedSearchContent],
          loadingNewPage: false
        })
      })
  }

  handleScroll = throttle(500, () => {
    if (this.state.loadingNewPage) return

    if (
      this.state.advancedSearchContent.length < 20 ||
      this.state.totalPagesAdvMovies <= this.state.numOfPagesLoaded
    )
      return

    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 850) {
      const {
        year,
        yearRangeStart,
        yearRangeFinish,
        getWithGenres,
        getWithoutGenres,
        rating,
        voteCountMoreThan,
        sortBy,
        getActors,
        mediaType,
        sortTvDate
      } = this.state.advSearchInputValues

      const pageNum = this.state.numOfPagesLoaded + 1

      const { advancedSearchContent } = this.state

      const getMovies =
        mediaType === "movie" &&
        `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US\
&include_adult=false&include_video=true&page=${pageNum}&primary_release_year=${year}&\
primary_release_date.gte=${yearRangeStart}&primary_release_date.lte=${yearRangeFinish}\
&with_genres=${getWithGenres}&without_genres=${getWithoutGenres}&vote_average.gte=${rating}&\
vote_count.gte=${voteCountMoreThan}&sort_by=${sortBy}&with_people=${getActors}`

      const getTvShows =
        mediaType === "tv" &&
        `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.REACT_APP_TMDB_API}\
&language=en-US&page=${pageNum}&sort_by=${sortTvDate}&first_air_date.gte=${yearRangeStart}&first_air_date.lte=${yearRangeFinish}\
&first_air_date_year=${year}&vote_average.gte=${rating}&vote_count.gte=${voteCountMoreThan}&include_null_first_air_dates=false\
&with_genres=${getWithGenres}&without_genres=${getWithoutGenres}`

      this.loadMorePages(getMovies, getTvShows, advancedSearchContent, pageNum)
    }
  })

  clearAdvSearchMovies = () => {
    this.setState({ advancedSearchContent: [], advSearchNoResults: false })
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
    const { advancedSearchContent, totalPagesAdvMovies } = this.state
    return !Array.isArray(advancedSearchContent) || totalPagesAdvMovies === 0 ? (
      <div className="content-results content-results--adv-search">
        <PlaceholderNoResults message="No content found" />
      </div>
    ) : (
      <AdvSearchResults
        advancedSearchContent={this.state.advancedSearchContent}
        loadingNewPage={this.state.loadingNewPage}
        clearAdvSearchMovies={this.clearAdvSearchMovies}
      />
    )
  }

  render() {
    return (
      <>
        <Header />
        <div className="search-page__search">
          <Search />
          <AdvancedSearch
            advancedSearch={this.advancedSearch}
            searchingAdvancedSearch={this.state.searchingAdvancedSearch}
            toggleActor={this.toggleActor}
            withActors={this.state.withActors}
            clearWithActors={this.clearWithActors}
          />
        </div>
        {this.renderAdvMovies()}

        <ScrollToTop />
        {/* <Footer /> */}
      </>
    )
  }
}

export default SearchPage
