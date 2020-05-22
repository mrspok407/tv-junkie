import React from "react"
import SelectedContentContext from "./SelectedContentContext"
import { withFirebase } from "Components/Firebase"
import { compose } from "recompose"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"

const withSelectedContextConsumer = Component => {
  class WithSelectedContextConsumer extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        watchingTvShows: []
      }
    }

    componentDidMount() {
      this.getContent()
    }

    getContent = () => {
      const firebase = this.props.firebase

      firebase.auth.onAuthStateChanged(authUser => {
        // const firebaseDb = firebase[dataBase(authUser.uid)]
        firebase.userContent(authUser.uid).on("value", snapshot => {
          const userContent = snapshot.val()
          const userWatchingTvShows = userContent && userContent.watchingtvshows
          const userDroppedTvShows = userContent && userContent.droppedtvshows

          const watchingTvShowsList = userWatchingTvShows
            ? Object.keys(userWatchingTvShows).map(key => ({
                ...userWatchingTvShows[key],
                uid: key
              }))
            : []

          const droppedTvShowsList = userDroppedTvShows
            ? Object.keys(userDroppedTvShows).map(key => ({
                ...userDroppedTvShows[key],
                uid: key
              }))
            : []

          this.setState({
            watchingTvShows: watchingTvShowsList,
            droppedTvShows: droppedTvShowsList
          })
        })
      })
    }

    componentWillUnmount() {
      this.props.firebase.userContent(this.props.authUser.uid).off()
    }

    render() {
      return (
        <SelectedContentContext.Consumer>
          {selectedContent => (
            <Component
              {...this.props}
              watchingTvShows={this.state.watchingTvShows}
              droppedTvShows={this.state.droppedTvShows}
              selectedContentState={selectedContent}
            />
          )}
        </SelectedContentContext.Consumer>
      )
    }
  }
  return compose(withFirebase, WithAuthenticationConsumer)(WithSelectedContextConsumer)
}

export default withSelectedContextConsumer
