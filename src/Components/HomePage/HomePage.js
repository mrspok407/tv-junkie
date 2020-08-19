import React, { Component } from "react"
import { Helmet } from "react-helmet"
import { Link } from "react-router-dom"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import { withUserContent } from "Components/UserContent"
import axios from "axios"
import ScrollToTop from "Utils/ScrollToTop"
import HeaderBase from "Components/Header/Header"
import CalendarContent from "Components/CalendarPage/CalendarContent"
import Slider from "Utils/Slider/Slider"
import PlaceholderHomePageNoFutureEpisodes from "Components/Placeholders/PlaceholderHomePageNoFutureEpisodes"
import * as ROUTES from "Utils/Constants/routes"
import "./HomePage.scss"
import Footer from "Components/Footer/Footer"

const Header = withFirebase(HeaderBase)

class HomePage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      sliders: {
        weekTvTrending: {
          name: "Trending this week",
          data: []
        },
        popularDramas: {
          name: "Popular dramas",
          data: []
        },
        popularComedies: {
          name: "Popular comedies",
          data: []
        },
        popularCrime: {
          name: "Popular crime",
          data: []
        }
      },
      slidersLoading: false,
      calendarLoading: false,
      willAirEpisodes: [],
      error: ""
    }
  }

  componentDidMount() {
    this.getContentForSliders()
    // this.testFun()
  }

  testFun = () => {
    this.props.firebase.allShowsList("ongoing").once("value", snapshot => {
      if (snapshot.val() === null) return

      let shows = []
      snapshot.forEach(item => {
        shows = [...shows, item.val()]
      })

      shows.forEach(show => {
        axios
          .get(
            `https://api.themoviedb.org/3/tv/${show.id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`
          )
          .then(({ data: { number_of_seasons } }) => {
            const maxSeasonsInChunk = 20
            const allSeasons = []
            const seasonChunks = []
            const apiRequests = []

            for (let i = 1; i <= number_of_seasons; i += 1) {
              allSeasons.push(`season/${i}`)
            }

            for (let i = 0; i <= allSeasons.length; i += maxSeasonsInChunk) {
              const chunk = allSeasons.slice(i, i + maxSeasonsInChunk)
              seasonChunks.push(chunk.join())
            }

            seasonChunks.forEach(item => {
              const request = axios.get(
                `https://api.themoviedb.org/3/tv/${show.id}?api_key=${process.env.REACT_APP_TMDB_API}&append_to_response=${item}`
              )
              apiRequests.push(request)
            })

            return axios.all([...apiRequests])
          })
          .then(
            axios.spread((...responses) => {
              const rowData = []
              const seasonsData = []

              responses.forEach(item => {
                rowData.push(item.data)
              })

              const mergedRowData = Object.assign({}, ...rowData)

              Object.entries(mergedRowData).forEach(([key, value]) => {
                if (!key.indexOf("season/")) {
                  seasonsData.push({ [key]: { ...value } })
                }
              })

              let allEpisodes = []

              seasonsData.forEach((item, index) => {
                const season = item[`season/${index + 1}`]
                if (!Array.isArray(season.episodes) || season.episodes.length === 0) return

                let episodes = []

                season.episodes.forEach(item => {
                  const updatedEpisode = {
                    air_date: item.air_date,
                    episode_number: item.episode_number,
                    name: item.name,
                    season_number: item.season_number,
                    id: item.id
                  }
                  episodes.push(updatedEpisode)
                })

                const updatedSeason = {
                  air_date: season.air_date,
                  season_number: season.season_number,
                  id: season._id,
                  poster_path: season.poster_path,
                  name: season.name,
                  episodes
                }

                allEpisodes.push(updatedSeason)
              })

              const dataToPass = {
                episodes: allEpisodes,
                status: mergedRowData.status
              }

              return dataToPass
            })
          )
          .then(data => {
            this.props.firebase
              .allShowsList("ongoing")
              .child(show.id)
              .update({ episodes: data.episodes })
          })
          .catch(err => {
            console.log(err)
          })
      })
    })
  }

  getContentForSliders = () => {
    this.setState({ slidersLoading: true })

    const weekTvTrending = axios.get(
      `https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.REACT_APP_TMDB_API}`
    )

    const popularDramasPromise = axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${process.env.REACT_APP_TMDB_API}&\
    language=en-US&page=1&sort_by=vote_count.desc&first_air_date.gte=&first_air_date.lte=&first_air_date_year=&vote_average.gte=&\
    vote_count.gte=25&include_null_first_air_dates=false&with_genres=18&without_genres=16,35,9648`)

    const popularComediesPromise = axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US&\
    page=2&sort_by=vote_count.desc&first_air_date.gte=&first_air_date.lte=&first_air_date_year=&vote_average.gte=&vote_count.gte=25&\
    include_null_first_air_dates=false&with_genres=35&without_genres=16,18`)

    const popularCrimePromise = axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US&\
    page=2&sort_by=vote_count.desc&first_air_date.gte=&first_air_date.lte=&first_air_date_year=&vote_average.gte=&vote_count.gte=25&\
    include_null_first_air_dates=false&with_genres=80&without_genres=16,35,9648,10759,10765`)

    const promises = [weekTvTrending, popularDramasPromise, popularComediesPromise, popularCrimePromise]

    axios
      .all(promises)
      .then(
        axios.spread((...responses) => {
          responses.forEach((res, index) => {
            const key = Object.keys(this.state.sliders)[index]
            this.setState({
              sliders: {
                ...this.state.sliders,
                [key]: {
                  ...this.state.sliders[key],
                  data: res.data.results
                }
              }
            })
          })

          this.setState({ slidersLoading: false })
        })
      )
      .catch(err => {
        this.setState({
          error: `Something went wrong, sorry. ${err}`,
          slidersLoading: false
        })
      })
  }

  handleCalendarState = ({ loading = false, willAirEpisodes = [] }) => {
    this.setState({
      calendarLoading: loading,
      willAirEpisodes
    })
  }

  renderNonAuthUser = () => (
    <>
      <div className="home-page__heading">
        <h1>With this app you can</h1>

        <div className="home-page__heading-features">
          <ul className="home-page__heading-list">
            <li className="home-page__heading-item">Keep track of your watching or finished shows</li>
            <li className="home-page__heading-item">Check episodes you watched</li>
            <li className="home-page__heading-item">Get list of all episodes you haven't watched yet</li>
          </ul>
          <ul className="home-page__heading-list">
            <li className="home-page__heading-item">See dates of upcoming episodes</li>
            <li className="home-page__heading-item">Also, you can add some movies to watch later</li>
            <li className="home-page__heading-item">Made with React + Firebase</li>
          </ul>
        </div>
        <div className="home-page__heading-register">
          <Link to={ROUTES.LOGIN_PAGE} className="home-page__heading-link">
            Register
          </Link>{" "}
          to get access to full features
        </div>
      </div>

      {!this.state.slidersLoading && (
        <div className="home-page__sliders home-page__sliders--non-auth">
          {Object.values(this.state.sliders).map(value => {
            return (
              <div key={value.name} className="home-page__slider">
                <h2 className="home-page__slider-heading">{value.name}</h2>
                <Slider listOfContent={value.data} />
              </div>
            )
          })}
        </div>
      )}
    </>
  )

  renderAuthUser = () => (
    <>
      {!this.state.calendarLoading && (
        <>
          {this.state.willAirEpisodes.length > 0 ? (
            <div className="home-page__heading">
              <h1 onClick={() => this.testFun()}>Soon to watch</h1>
            </div>
          ) : (
            <PlaceholderHomePageNoFutureEpisodes />
          )}
        </>
      )}

      <CalendarContent homePage={true} handleCalendarState={this.handleCalendarState} />

      {!this.state.calendarLoading && !this.state.slidersLoading && (
        <div className="home-page__sliders">
          {Object.values(this.state.sliders).map(value => {
            return (
              <div key={value.name} className="home-page__slider">
                <h2 className="home-page__slider-heading">{value.name}</h2>
                <Slider listOfContent={value.data} />
              </div>
            )
          })}
        </div>
      )}
    </>
  )

  render() {
    return (
      <>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Tv Junkie</title>
        </Helmet>
        <Header />
        <div className="home-page__wrapper">
          {!this.props.authUser ? this.renderNonAuthUser() : this.renderAuthUser()}
        </div>
        <Footer />
        <ScrollToTop />
      </>
    )
  }
}

export default withUserContent(HomePage)
