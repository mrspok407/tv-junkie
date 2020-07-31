import React, { Component } from "react"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import axios, { CancelToken } from "axios"
import ScrollToTop from "Utils/ScrollToTop"
import HeaderBase from "Components/Header/Header"
import CalendarContent from "Components/CalendarPage/CalendarContent"
import "./HomePage.scss"
import Slider from "Utils/Slider/Slider"
import Loader from "Components/Placeholders/Loader"

const Header = withFirebase(HeaderBase)
let cancelRequest

class HomePage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      weekTvTrending: [],
      initialLoading: false,
      calendarLoading: false,
      error: ""
    }
  }

  componentDidMount() {
    this.getContentForSliders()
  }

  getContentForSliders = () => {
    this.setState({ initialLoading: true })
    axios
      .get(`https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.REACT_APP_TMDB_API}`, {
        cancelToken: new CancelToken(function executor(c) {
          cancelRequest = c
        })
      })
      .then(({ data: { results } }) => {
        this.setState({
          weekTvTrending: results,
          initialLoading: false
        })
      })
      .catch(err => {
        if (axios.isCancel(err)) return
        this.setState({
          error: "Something went wrong, sorry",
          initialLoading: false
        })
      })
  }

  handleCalendarLoading = condition => {
    this.setState({
      calendarLoading: condition
    })
  }

  render() {
    return (
      <>
        <Header />
        {this.state.initialLoading ? (
          <Loader className="loader--pink" />
        ) : (
          <>
            <CalendarContent homePage={true} handleCalendarLoading={this.handleCalendarLoading} />
            {!this.state.calendarLoading && (
              <div className="home-page__sliders">
                <Slider listOfContent={this.state.weekTvTrending} />
              </div>
            )}
          </>
        )}
        <ScrollToTop />
      </>
    )
  }
}

export default HomePage
