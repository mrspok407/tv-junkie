import React, { useEffect, useReducer } from "react"
import { Link, useHistory } from "react-router-dom"
import { Helmet } from "react-helmet"
import * as ROUTES from "Utils/Constants/routes"
import Header from "Components/UI/Header/Header"
import logo404 from "assets/images/doge-404.png"
import Footer from "Components/UI/Footer/Footer"
import "./PageNotFound.scss"

const COUNTDOWN_INTERVAL = 1000
const initialState = {
  countdownToRedirect: 5
}

const PageNotFound: React.FC = () => {
  const history = useHistory()

  const reducer = (state: { countdownToRedirect: number }, action: { type: string }) => {
    const { countdownToRedirect } = state
    if (action.type === "subtract") {
      return { countdownToRedirect: countdownToRedirect - 1 }
    } else {
      throw new Error()
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      dispatch({ type: "subtract" })
    }, COUNTDOWN_INTERVAL)

    return () => {
      clearTimeout(countdownTimer)
    }
  }, [])

  useEffect(() => {
    if (state.countdownToRedirect === 0) {
      history.push(ROUTES.HOME_PAGE)
    }
  }, [state.countdownToRedirect, history])

  return (
    <>
      <Helmet>
        <title>So empty page | TV Junkie</title>
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
            {state.countdownToRedirect} {state.countdownToRedirect === 1 ? "second" : "seconds"}
          </span>
        </h1>
      </div>
      <Footer />
    </>
  )
}

export default PageNotFound

// class PageNotFound extends Component {
//   constructor(props) {
//     super(props)

//     this.state = {
//       countdownToRedirect: TIME_TO_REDIRECT
//     }

//     this.countdownTimer = null
//   }

//   componentDidMount() {
//     this.props.history.push(ROUTES.PAGE_DOESNT_EXISTS)
//     this.countdownHandler()
//   }

//   componentWillUnmount() {
//     clearTimeout(this.countdownTimer)
//   }

//   countdownHandler = () => {
//     this.countdownTimer = setInterval(() => {
//       this.setState({ countdownToRedirect: this.state.countdownToRedirect - 1 }, () => {
//         if (this.state.countdownToRedirect === 0) this.props.history.push(ROUTES.HOME_PAGE)
//       })
//     }, COUNTDOWN_INTERVAL)
//   }

//   render() {
//     return (
//       <>
//         <Helmet>
//           <title>So empty page | TV Junkie</title>
//         </Helmet>
//         <Header isLogoVisible={false} />
//         <div className="page-not-found">
//           <img className="page-not-found__img" src={logo404} alt="page not found" />
//           <h1 className="page-not-found__heading">
//             Very not existing page. You'll be redirected to{" "}
//             <Link className="page-not-found__link" to={ROUTES.HOME_PAGE}>
//               Home Page
//             </Link>{" "}
//             in{" "}
//             <span>
//               {this.state.countdownToRedirect} {this.state.countdownToRedirect === 1 ? "second" : "seconds"}
//             </span>
//           </h1>
//         </div>
//         <Footer />
//       </>
//     )
//   }
// }

// export default withRouter(PageNotFound)
