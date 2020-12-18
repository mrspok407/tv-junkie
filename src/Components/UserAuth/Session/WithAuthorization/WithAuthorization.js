import React from "react"
import { withRouter } from "react-router-dom"
import * as ROUTES from "Utils/Constants/routes"
import { AppContext } from "Components/AppContext/AppContextHOC"

const withAuthorization = (condition) => (Component) => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      this.authorizationListener()
    }

    componentWillUnmount() {
      this.authorizationListener()
    }

    authorizationListener = () =>
      this.context.firebase.onAuthUserListener(
        (authUser) => {
          if (!condition(authUser)) {
            this.props.history.push(ROUTES.HOME_PAGE)
          }
        },
        () => this.props.history.push(ROUTES.HOME_PAGE)
      )

    render() {
      return condition(this.context.authUser) ? <Component {...this.props} /> : null
    }
  }
  WithAuthorization.contextType = AppContext
  return withRouter(WithAuthorization)
}

export default withAuthorization
