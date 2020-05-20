import React, { Component } from "react"
import { compose } from "recompose"
import { withFirebase } from "Components/Firebase"
import SignOutButton from "Components/UserAuth/SignOut/SignOutButton"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import "./Profile.scss"
import Header from "Components/Header/Header"

class Profile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      users: []
    }
  }

  componentDidMount() {
    this.setState({ loading: true })

    this.props.firebase.auth.onAuthStateChanged(authUser => {
      this.props.firebase.userMovies(authUser.uid).on("value", snapshot => {
        const usersObject = snapshot.val() ? snapshot.val() : {}

        const userList = Object.keys(usersObject).map(key => ({
          ...usersObject[key],
          uid: key
        }))

        this.setState({
          users: userList,
          loading: false
        })
      })
    })
  }

  componentWillUnmount() {
    this.props.firebase.users().off()
  }

  render() {
    const userEmail = this.props.authUser.email
    return (
      <>
        <Header />
        <div className="user-profile">
          <SignOutButton />
          {userEmail}
          {this.state.users.map(({ title, id }) => (
            <div key={id}>{title}</div>
          ))}
        </div>
      </>
    )
  }
}

const condition = authUser => authUser !== null

export default compose(withFirebase, WithAuthenticationConsumer, WithAuthorization(condition))(Profile)
