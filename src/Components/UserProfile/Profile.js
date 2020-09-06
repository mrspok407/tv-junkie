import React, { Component } from "react"
import { compose } from "recompose"
import { Helmet } from "react-helmet"
import SignOutButton from "Components/UserAuth/SignOut/SignOutButton"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import Header from "Components/Header/Header"
import "./Profile.scss"
import Footer from "Components/Footer/Footer"
import { withUserContent } from "Components/UserContent"

class Profile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      verificationSent: false
    }
  }

  sendEmailVerification = () => {
    this.props.firebase.sendEmailVerification()
    this.setState({ verificationSent: true })
  }

  componentDidMount() {
    // this.databaseModify()
  }

  databaseModify = () => {
    this.props.firebase.users().once("value", snapshot => {
      let users = []
      snapshot.forEach(item => {
        users = [...users, { ...item.val(), key: item.key }]
      })

      users.forEach(user => {
        this.props.userContent.showsDatabases.forEach(database => {
          this.props.firebase.userShows(user.key, database).once("value", snapshot => {
            let shows = []
            snapshot.forEach(item => {
              shows = [...shows, item.val()]
            })

            shows.forEach(show => {
              this.props.firebase
                .userEpisodes(user.key)
                .child(show.id)
                .once("value", snapshot => {
                  // const userEpisodes = {
                  //   episodes: snapshot.val(),
                  //   info: {
                  //     allEpisodesWatched: show.allEpisodesWatched,
                  //     finished: show.finished_and_name.slice(0, 4) === "true" ? true : false
                  //   }
                  // }

                  // this.props.firebase
                  //   .userEpisodes(user.key)
                  //   .child(show.id)
                  //   .set(userEpisodes)

                  const finished = snapshot.val().info.finished

                  this.props.firebase.userShow({ uid: user.key, key: show.id, database }).update({
                    episodes: null,
                    allEpisodesWatched: null,
                    finished_and_name: null,
                    finished_and_timeStamp: null,
                    finished
                  })
                })
            })
          })
        })
      })
    })
  }

  render() {
    return (
      <>
        <Helmet>
          <title>Profile | TV Junkie</title>
        </Helmet>
        <Header />
        <div className="user-profile">
          <div className="user-profile__email">
            Sign in with <span>{this.props.authUser.email}</span>
          </div>
          <div className="user-profile__verified">
            {this.props.authUser.emailVerified ? (
              "Email verified"
            ) : (
              <>
                Email not verified{" "}
                <button onClick={this.sendEmailVerification} className="button" type="button">
                  {this.state.verificationSent ? "Verification sent" : "Send email verification"}
                </button>
              </>
            )}
          </div>
          <div className="user-profile__signout">
            <SignOutButton />
          </div>
        </div>
        <Footer />
      </>
    )
  }
}

const condition = authUser => authUser !== null

export default compose(WithAuthenticationConsumer, withUserContent, WithAuthorization(condition))(Profile)
