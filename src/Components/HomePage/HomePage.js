import React, { Component } from "react"
import { Helmet } from "react-helmet"
import { Link } from "react-router-dom"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import { withUserContent } from "Components/UserContent"
import axios from "axios"
import ScrollToTop from "Utils/ScrollToTopBar"
import HeaderBase from "Components/Header/Header"
import CalendarContent from "Components/CalendarPage/CalendarContent"
import Slider from "Utils/Slider/Slider"
import PlaceholderHomePageNoFutureEpisodes from "Components/Placeholders/PlaceholderHomePageNoFutureEpisodes"
import * as ROUTES from "Utils/Constants/routes"
import "./HomePage.scss"
import Footer from "Components/Footer/Footer"
import { AppContext } from "Components/AppContext/AppContextHOC"

const Header = withFirebase(HeaderBase)

class HomePage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      sliders: {
        weekTvTrending: {
          name: "Trending this week",
          data: [],
        },
        popularDramas: {
          name: "Popular dramas",
          data: [],
        },
        popularComedies: {
          name: "Popular comedies",
          data: [],
        },
        popularCrime: {
          name: "Popular crime",
          data: [],
        },
      },
      slidersLoading: false,
      calendarLoading: false,
      willAirEpisodes: [],
      error: "",
    }
  }

  componentDidMount() {
    this.getContentForSliders()
    console.log(this.props.firebase)
  }

  // databaseModify = () => {
  //   this.props.firebase.users().once("value", (snapshot) => {
  //     let users = []
  //     snapshot.forEach((item) => {
  //       users = [...users, { ...item.val(), key: item.key }]
  //     })

  //     users.forEach((user) => {
  //       if (user.email !== "mr.spok407@gmail.com") return

  //       this.props.firebase.userAllShows(user.key).once("value", (snapshot) => {
  //         let episodes = {}

  //         const shows = Object.entries(snapshot.val()).reduce((acc, [key, value]) => {
  //           if (key === "finishedShows") return acc

  //           const showsInOneDatabase = Object.values(value).reduce((acc, show) => {
  //             acc = {
  //               ...acc,
  //               [show.id]: {
  //                 allEpisodesWatched: show.allEpisodesWatched,
  //                 database: key,
  //                 finished: show.finished_and_name.slice(0, 4) === "true" ? true : false,
  //                 firstAirDate: show.firstAirDate,
  //                 id: show.id,
  //                 name: show.name,
  //                 status: show.status,
  //                 timeStamp: show.timeStamp * -1,
  //               },
  //             }

  //             episodes = {
  //               ...episodes,
  //               [show.id]: {
  //                 episodes: show.episodes,
  //                 info: {
  //                   allEpisodesWatched: show.allEpisodesWatched,
  //                   database: key,
  //                   finished: show.finished_and_name.slice(0, 4) === "true" ? true : false,
  //                 },
  //               },
  //             }

  //             return acc
  //           }, {})

  //           acc = {
  //             ...acc,
  //             ...showsInOneDatabase,
  //           }

  //           return acc
  //         }, {})

  //         console.log(episodes)
  //         console.log(shows)

  //         this.props.firebase.userAllShows(user.key).set(shows)
  //         this.props.firebase.userEpisodes(user.key).set(episodes)
  //       })

  //       // this.props.firebase.userAllShows(user.key).once("value", snapshot => {
  //       //   if (snapshot.val() === null) return

  //       //   Object.entries(snapshot.val()).forEach(([key, value]) => {
  //       //     this.props.firebase.userShowAllEpisodesInfo(user.key, key).update({ database: value.database })
  //       //   })
  //       // })
  //     })
  //   })
  // }

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
          const sliders = responses.reduce((acc, value, index) => {
            const key = Object.keys(this.state.sliders)[index]
            acc = {
              ...acc,
              [key]: {
                name: this.state.sliders[key].name,
                data: value.data.results,
              },
            }
            return acc
          }, {})

          this.setState({
            sliders,
            slidersLoading: false,
          })
        })
      )
      .catch((err) => {
        this.setState({
          error: `Something went wrong, sorry. ${err}`,
          slidersLoading: false,
        })
      })
  }

  handleCalendarState = ({ loading = false, willAirEpisodes = [] }) => {
    this.setState({
      calendarLoading: loading,
      willAirEpisodes,
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
          {Object.values(this.state.sliders).map((value) => {
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
      {!this.context.userContent.loadingShows && (
        <>
          {this.context.userContent.userWillAirEpisodes.length > 0 ? (
            <div className="home-page__heading">
              <h1>Soon to watch</h1>
            </div>
          ) : (
            <PlaceholderHomePageNoFutureEpisodes />
          )}
        </>
      )}

      <CalendarContent homePage={true} handleCalendarState={this.handleCalendarState} />

      {!this.context.userContent.loadingShows && !this.state.slidersLoading && (
        <div className="home-page__sliders">
          {Object.values(this.state.sliders).map((value) => {
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
          <title>TV Junkie</title>
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

HomePage.contextType = AppContext
