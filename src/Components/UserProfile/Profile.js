import React, { Component } from "react"
import { compose } from "recompose"
import SignOutButton from "Components/UserAuth/SignOut/SignOutButton"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import "./Profile.scss"
import Header from "Components/Header/Header"
// import { withUserContent } from "Components/UserContent"

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
  //     this.props.firebase.watchingShows(authUser.uid).on("value", snapshot => {
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
  //   // this.props.firebase.watchingShows().off()
  //   this.props.firebase.auth.onAuthStateChanged(authUser => {
  //     this.props.firebase.watchingShows(authUser.uid).off()
  //   })
  // }

  sendEmailVerification = () => {
    this.props.firebase.sendEmailVerification()
  }

  render() {
    // const userEmail = this.props.authUser.email
    return (
      <>
        <Header />
        <div className="user-profile">
          <SignOutButton />
          {/* {userEmail} */}
          {/* {this.props.userContent.watchingShows.map(({ title, name, id }) => (
            <div key={id}>{title || name}</div>
          ))} */}
          <div>
            {/* {this.props.authUser.emailVerified ? (
              "Email verified"
            ) : (
              <div>
                Email not verified{" "}
                <button onClick={this.sendEmailVerification} type="button">
                  Send email verification
                </button>
              </div>
            )} */}
          </div>
        </div>
      </>
    )
  }
}

const condition = authUser => authUser !== null

export default compose(WithAuthorization(condition))(Profile)
