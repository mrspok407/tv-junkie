import React from "react"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import AuthUserContext from "./AuthUserContext"

const withAuthenticationProvider = (Component) => {
  class WithAuthenticationProvider extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        authUser: JSON.parse(localStorage.getItem("authUser"))
      }
    }

    componentDidMount() {
      console.log("auth provider mount")
      this.authUserListener()
    }

    componentWillUnmount() {
      console.log("auth provider unmount")
      this.authUserListener()
    }

    authUserListener = () => {
      this.props.firebase.onAuthUserListener(
        (authUser) => {
          console.log("setting authUser in LS")
          localStorage.setItem("authUser", JSON.stringify(authUser))
          this.setState({ authUser })
        },
        () => {
          localStorage.removeItem("authUser")
          this.setState({ authUser: null })
        }
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
