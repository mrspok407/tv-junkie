import React, { Component } from "react"
import { compose } from "recompose"
import { withFirebase } from "Components/Firebase"
import SignOutButton from "Components/UserAuth/SignOut/SignOutButton"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import "./Profile.scss"
import Header from "Components/Header/Header"
import { withSelectedContextConsumer } from "Components/SelectedContentContext"

class Profile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      // tvShows: []
    }
  }

  // componentDidMount() {
  //   this.setState({ loading: true })

  //   this.props.firebase.auth.onAuthStateChanged(authUser => {
  //     this.props.firebase.userWatchingTvShows(authUser.uid).on("value", snapshot => {
  //       const tvShowsObject = snapshot.val() || {}

  //       const tvShowsList = Object.keys(tvShowsObject).map(key => ({
  //         ...tvShowsObject[key],
  //         uid: key
  //       }))

  //       this.setState({
  //         tvShows: tvShowsList,
  //         loading: false
  //       })
  //     })
  //   })
  // }

  // componentWillUnmount() {
  //   // this.props.firebase.userWatchingTvShows().off()
  //   this.props.firebase.auth.onAuthStateChanged(authUser => {
  //     this.props.firebase.userWatchingTvShows(authUser.uid).off()
  //   })
  // }

  sendEmailVerification = () => {
    this.props.firebase.sendEmailVerification()
  }

  render() {
    const userEmail = this.props.authUser.email
    return (
      <>
        <Header />
        <div className="user-profile">
          <SignOutButton />
          {userEmail}
          {this.props.watchingTvShows.map(({ title, name, id }) => (
            <div key={id}>{title || name}</div>
          ))}
          <div>
            {this.props.authUser.emailVerified ? (
              "Email verified"
            ) : (
              <div>
                Email not verified{" "}
                <button onClick={this.sendEmailVerification} type="button">
                  Send email verification
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }
}

const condition = authUser => authUser !== null

export default compose(withSelectedContextConsumer, WithAuthorization(condition))(Profile)
