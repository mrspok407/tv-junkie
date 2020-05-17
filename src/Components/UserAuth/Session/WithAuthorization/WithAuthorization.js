import React from "react"
import { compose } from "recompose"
import { withRouter } from "react-router-dom"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import AuthUserContext from "../WithAuthentication/AuthUserContext"
import * as ROUTES from "Utils/Constants/routes"

const withAuthorization = condition => Component => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      this.authorizationListener()
    }

    componentWillUnmount() {
      this.authorizationListener()
    }

    authorizationListener = () => {
      this.props.firebase.auth.onAuthStateChanged(authUser => {
        if (!condition(authUser)) {
          this.props.history.push(ROUTES.SEARCH_PAGE)
        }
      })
    }

    render() {
      return (
        <AuthUserContext.Consumer>
          {authUser => (condition(authUser) ? <Component {...this.props} /> : null)}
        </AuthUserContext.Consumer>
      )
    }
  }
  return compose(withRouter, withFirebase)(WithAuthorization)
}

export default withAuthorization
