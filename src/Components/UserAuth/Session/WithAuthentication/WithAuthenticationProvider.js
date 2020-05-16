import React from "react"
import { withFirebase } from "../../../Firebase/FirebaseContext"
import AuthUserContext from "./AuthUserContext"

const withAuthenticationProvider = Component => {
  class WithAuthenticationProvider extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        authUser: null
      }
    }

    componentDidMount() {
      this.authUserListener()
    }

    componentWillUnmount() {
      this.authUserListener()
      console.log("unmounted")
    }

    authUserListener = () => {
      this.props.firebase.auth.onAuthStateChanged(authUser =>
        authUser ? this.setState({ authUser }) : this.setState({ authUser: null })
      )
    }

    render() {
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      )
    }
  }
  return withFirebase(WithAuthenticationProvider)
}

export default withAuthenticationProvider
