import React, { Component } from "react"
import { Link, withRouter } from "react-router-dom"
import { withFirebase } from "Components/Firebase"
import { compose } from "recompose"
import { Helmet } from "react-helmet"
import * as ROUTES from "Utils/Constants/routes"
import HeaderBase from "Components/Header/Header"
import logo404 from "assets/images/doge-404.png"
import "./PageNotFound.scss"
import Footer from "Components/Footer/Footer"

const Header = withFirebase(HeaderBase)

const TIME_TO_REDIRECT = 5
const COUNTDOWN_INTERVAL = 1000

class PageNotFound extends Component {
  constructor(props) {
    super(props)

    this.state = {
      countdownToRedirect: TIME_TO_REDIRECT
    }

    this.countdownTimer = null
  }

  componentDidMount() {
    this.props.history.push(ROUTES.PAGE_DOESNT_EXISTS)
    this.countdownHandler()
  }

  componentWillUnmount() {
    clearTimeout(this.countdownTimer)
  }

  countdownHandler = () => {
    this.countdownTimer = setInterval(() => {
      this.setState({ countdownToRedirect: this.state.countdownToRedirect - 1 }, () => {
        if (this.state.countdownToRedirect === 0) this.props.history.push(ROUTES.HOME_PAGE)
      })
    }, COUNTDOWN_INTERVAL)
  }

  render() {
    return (
      <>
        <Helmet>
          <title>Tv Junkie | So empty page</title>
        </Helmet>
        <Header isLogoVisible={false} />
        <div className="page-not-found">
          <img className="page-not-found__img" src={logo404} alt="page not found" />
          <h1 className="page-not-found__heading">
            Very not existing page. You'll be redirected to{" "}
            <Link className="page-not-found__link" to={ROUTES.HOME_PAGE}>
              Home Page
            </Link>{" "}
            in{" "}
            <span>
              {this.state.countdownToRedirect} {this.state.countdownToRedirect === 1 ? "second" : "seconds"}
            </span>
          </h1>
        </div>
        <Footer />
      </>
    )
  }
}

export default compose(withRouter)(PageNotFound)
