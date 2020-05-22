import React from "react"
import { withFirebase } from "Components/Firebase"
import { compose } from "recompose"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"

const withUserContent = Component => {
  class WithUserContent extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        watchingTvShows: [],
        droppedTvShows: [],
        willBeWatchingTvShows: [],
        toggleContent: this.toggleContent,
        addWatchingTvShow: this.addWatchingTvShow,
        removeWatchingTvShow: this.removeWatchingTvShow,
        addToDroppedShows: this.addToDroppedShows
      }
    }

    componentDidMount() {
      this.getContent()
    }

    componentDidUpdate() {
      console.log(this.state.watchingTvShows)
    }

    toggleContent = (id, contentArr) => {
      const firebase = this.props.firebase

      firebase.auth.onAuthStateChanged(authUser => {
        const item = contentArr && contentArr.find(item => item.id === id)
        const itemUpdated = { ...item, userWatching: true }
        let contentExists

        firebase
          .userWatchingTvShows(authUser.uid)
          .orderByChild("id")
          .equalTo(id)
          .once("value", snapshot => {
            contentExists = snapshot.val() !== null
          })
          .then(() => {
            if (contentExists) {
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

    toggleWatchingTvShowDataBase = (showId, userUid, userWatching) => {
      this.props.firebase
        .userWatchingTvShows(userUid)
        .orderByChild("id")
        .equalTo(showId)
        .once("value", snapshot => {
          const updates = {}
          snapshot.forEach(
            child =>
              (updates[child.key] = {
                ...snapshot.val()[child.key],
                userWatching: userWatching
              })
          )
          this.props.firebase.userWatchingTvShows(userUid).update(updates)
        })
    }

    addWatchingTvShow = (id, contentArr) => {
      const firebase = this.props.firebase
      const contentExists = this.state.watchingTvShows.some(show => show.id === id)

      firebase.auth.onAuthStateChanged(authUser => {
        const item = contentArr && contentArr.find(item => item.id === id)
        const itemUpdated = { ...item, userWatching: true }

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
            if (!contentExists) {
              firebase
                .userWatchingTvShows(authUser.uid)
                .push()
                .set(itemUpdated)
            } else {
              this.toggleWatchingTvShowDataBase(id, authUser.uid, true)
            }
          })
      })
    }

    removeWatchingTvShow = id => {
      const firebase = this.props.firebase
      const contentExists = this.state.watchingTvShows.some(show => show.id === id)

      firebase.auth.onAuthStateChanged(authUser => {
        if (contentExists) {
          this.toggleWatchingTvShowDataBase(id, authUser.uid, false)
        }
      })
    }

    addToDroppedShows = (id, contentArr) => {
      const firebase = this.props.firebase
      const contentExists = this.state.watchingTvShows.some(show => show.id === id)
      const allreadyDropped = this.state.droppedTvShows.some(show => show.id === id)

      if (allreadyDropped) return

      firebase.auth.onAuthStateChanged(authUser => {
        const item = contentArr && contentArr.find(item => item.id === id)

        if (contentExists) {
          this.toggleWatchingTvShowDataBase(id, authUser.uid, false)
        }

        firebase
          .userDroppedTvShows(authUser.uid)
          .push()
          .set(item)
      })
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
      return <Component {...this.props} userContent={this.state} />
    }
  }
  return compose(withFirebase, WithAuthenticationConsumer)(WithUserContent)
}

export default withUserContent
