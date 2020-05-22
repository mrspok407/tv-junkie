import React from "react"
import SelectedContentContext from "./SelectedContentContext"
import { compose } from "recompose"
import { withFirebase } from "Components/Firebase"
import { WithAuthenticationProvider } from "Components/UserAuth/Session/WithAuthentication"

const LOCAL_STORAGE_KEY_CONTENT = "selectedContent"

const withSelectedContextProvider = Component => {
  class WithSelectedContextProvider extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        toggleContent: this.toggleContent,
        addToDroppedShows: this.addToDroppedShows
      }
    }

    toggleContent = (id, contentArr) => {
      const firebase = this.props.firebase

      firebase.auth.onAuthStateChanged(authUser => {
        const item = contentArr && contentArr.find(item => item.id === id)
        const itemUpdated = { ...item, userWatching: true }
        let movieExist

        firebase
          .userWatchingTvShows(authUser.uid)
          .orderByChild("id")
          .equalTo(id)
          .once("value", snapshot => {
            movieExist = snapshot.val() !== null
          })
          .then(() => {
            if (movieExist) {
              firebase
                .userWatchingTvShows(authUser.uid)
                .orderByChild("id")
                .equalTo(id)
                .once("value", snapshot => {
                  const updates = {}
                  snapshot.forEach(
                    child =>
                      (updates[child.key] = {
                        ...snapshot.val()[child.key],
                        userWatching: !snapshot.val()[child.key].userWatching
                      })
                  )
                  firebase.userWatchingTvShows(authUser.uid).update(updates)
                })
            } else {
              firebase
                .userDroppedTvShows(authUser.uid)
                .orderByChild("id")
                .equalTo(id)
                .once("value", snapshot => {
                  const updates = {}
                  snapshot.forEach(child => (updates[child.key] = null))
                  firebase.userDroppedTvShows(authUser.uid).update(updates)
                })
                .then(() => {
                  firebase
                    .userWatchingTvShows(authUser.uid)
                    .push()
                    .set(itemUpdated)
                })
            }
          })
      })
    }

    addToDroppedShows = (id, contentArr) => {
      const firebase = this.props.firebase

      firebase.auth.onAuthStateChanged(authUser => {
        const item = contentArr && contentArr.find(item => item.id === id)
        const itemUpdated = { ...item, userWatching: true }
        let itemExist

        firebase
          .userContent(authUser.uid)
          .once("value", snapshot => {
            const userContent = snapshot.val()
            const userWatchingTvShows = userContent.watchingtvshows
            const watchingTvShowsList = Object.keys(userWatchingTvShows).map(key => ({
              ...userWatchingTvShows[key],
              uid: key
            }))

            itemExist = watchingTvShowsList.some(item => item.id === id)

            if (itemExist) {
              firebase
                .userWatchingTvShows(authUser.uid)
                .orderByChild("id")
                .equalTo(id)
                .once("value", snapshot => {
                  const updates = {}
                  snapshot.forEach(child => (updates[child.key] = null))
                  firebase.userWatchingTvShows(authUser.uid).update(updates)
                })
            }
          })
          .then(() => {
            firebase
              .userDroppedTvShows(authUser.uid)
              .push()
              .set(itemUpdated)
          })
      })
    }

    render() {
      return (
        <SelectedContentContext.Provider value={this.state}>
          <Component {...this.props} />
        </SelectedContentContext.Provider>
      )
    }
  }
  return compose(withFirebase)(WithSelectedContextProvider)
}

export default withSelectedContextProvider
