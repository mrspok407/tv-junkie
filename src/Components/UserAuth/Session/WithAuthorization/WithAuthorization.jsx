/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { withRouter } from 'react-router-dom'
import * as ROUTES from 'Utils/Constants/routes'
import { AppContext } from 'Components/AppContext/AppContextHOC'

const withAuthorization = (condition) => (Component) => {
  class WithAuthorization extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        authUser: {
          uid: '',
        },
      }
    }

    componentDidMount() {
      this.authorizationListener()
    }

    componentWillUnmount() {
      this.authorizationListener()
    }

    componentDidUpdate() {
      console.log({ update: this.state.authUser })
      console.log(condition(this.state.authUser))
    }

    authorizationListener = () =>
      this.context.firebase.onAuthUserListener(
        (authUser) => {
          if (!condition(authUser)) {
            this.props.history.push(ROUTES.HOME_PAGE)
          } else {
            console.log({ authUser })
            this.setState({ authUser })
          }
        },
        () => this.props.history.push(ROUTES.HOME_PAGE),
      )

    render() {
      return condition(this.state.authUser) ? <Component {...this.props} /> : <div>test</div>
    }
  }
  WithAuthorization.contextType = AppContext
  return withRouter(WithAuthorization)
}

export default withAuthorization
