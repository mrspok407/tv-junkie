import React from "react"
import { withFirebase } from "Components/Firebase"
import { compose } from "recompose"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import { toggleWatchingTvShowDataBase, deleteTvShowFromSubDataBase } from "./FirebaseHelpers"

const withUserContent = Component => {
  class WithUserContent extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        watchingTvShows: [],
        droppedTvShows: [],
        willBeWatchingTvShows: [],
        addWatchingTvShow: this.addWatchingTvShow,
        removeWatchingTvShow: this.removeWatchingTvShow,
        addDroppedShows: this.addDroppedShows,
        addWillBeWatchingTvShows: this.addWillBeWatchingTvShows
      }
    }

    componentDidMount() {
      this.getContent()
    }

    componentDidUpdate() {
      console.log(this.state.watchingTvShows)
    }

    // toggleContent = (id, contentArr) => {
    //   const firebase = this.props.firebase

    //   firebase.auth.onAuthStateChanged(authUser => {
    //     const item = contentArr && contentArr.find(item => item.id === id)
    //     const itemUpdated = { ...item, userWatching: true }
    //     let contentExists

    //     firebase
    //       .userWatchingTvShows(authUser.uid)
    //       .orderByChild("id")
    //       .equalTo(id)
    //       .once("value", snapshot => {
    //         contentExists = snapshot.val() !== null
    //       })
    //       .then(() => {
    //         if (contentExists) {
    //           // firebase
    //           //   .userWatchingTvShows(authUser.uid)
    //           //   .orderByChild("id")
    //           //   .equalTo(id)
    //           //   .once("value", snapshot => {
    //           //     const updates = {}
    //           //     snapshot.forEach(
    //           //       child =>
    //           //         (updates[child.key] = {
    //           //           ...snapshot.val()[child.key],
    //           //           userWatching: !snapshot.val()[child.key].userWatching
    //           //         })
    //           //     )
    //           //     firebase.userWatchingTvShows(authUser.uid).update(updates)
    //           //   })
    //         } else {
    //           firebase
    //             .userDroppedTvShows(authUser.uid)
    //             .orderByChild("id")
    //             .equalTo(id)
    //             .once("value", snapshot => {
    //               const updates = {}
    //               snapshot.forEach(child => (updates[child.key] = null))
    //               firebase.userDroppedTvShows(authUser.uid).update(updates)
    //             })
    //             .then(() => {
    //               firebase
    //                 .userWatchingTvShows(authUser.uid)
    //                 .push()
    //                 .set(itemUpdated)
    //             })
    //         }
    //       })
    //   })
    // }

    addWatchingTvShow = (id, contentArr) => {
      const firebase = this.props.firebase
      const userUid = this.props.authUser.uid
      const contentExists = this.state.watchingTvShows.some(show => show.id === id)

      const item = contentArr && contentArr.find(item => item.id === id)
      const itemUpdated = { ...item, userWatching: true }

      // firebase
      //   .userDroppedTvShows(authUser.uid)
      //   .orderByChild("id")
      //   .equalTo(id)
      //   .once("value", snapshot => {
      //     const updates = {}
      //     snapshot.forEach(child => (updates[child.key] = null))
      //     firebase.userDroppedTvShows(authUser.uid).update(updates)
      //   })
      const notWatchingTvShows = [...this.state.droppedTvShows, ...this.state.willBeWatchingTvShows]
      // const key = notWatchingTvShows.length > 0 ? notWatchingTvShows.find(item => item.id === id).key : null

      const tvShow = notWatchingTvShows.find(item => item.id === id)
      const key = tvShow ? tvShow.key : null

      console.log(key)

      deleteTvShowFromSubDataBase(
        firebase,
        userUid,
        ["userDroppedTvShows", "userWillBeWatchingTvShows"],
        key
      ).then(() => {
        if (!contentExists) {
          const newTvShowRef = firebase.userWatchingTvShows(userUid).push()
          const key = newTvShowRef.key

          newTvShowRef.set({ ...itemUpdated, key })
        } else {
          toggleWatchingTvShowDataBase(firebase, id, userUid, true)
        }
      })
    }

    removeWatchingTvShow = id => {
      const firebase = this.props.firebase
      const contentExists = this.state.watchingTvShows.some(show => show.id === id)

      firebase.auth.onAuthStateChanged(authUser => {
        if (contentExists) {
          toggleWatchingTvShowDataBase(this.props.firebase, id, authUser.uid, false)
        }
      })
    }

    addDroppedShows = (id, contentArr) => {
      const firebase = this.props.firebase
      const userUid = this.props.authUser.uid
      const contentExists = this.state.watchingTvShows.some(show => show.id === id)
      const allreadyDropped = this.state.droppedTvShows.some(show => show.id === id)
      const item = contentArr && contentArr.find(item => item.id === id)

      if (allreadyDropped) return
      if (contentExists) {
        toggleWatchingTvShowDataBase(firebase, id, userUid, false)
      }

      // const key =
      //   this.state.willBeWatchingTvShows.length > 0
      //     ? this.state.willBeWatchingTvShows.find(item => item.id === id).key
      //     : null

      const tvShow = this.state.willBeWatchingTvShows.find(item => item.id === id)
      const key = tvShow ? tvShow.key : null

      deleteTvShowFromSubDataBase(firebase, userUid, ["userWillBeWatchingTvShows"], key).then(() => {
        const newTvShowRef = firebase.userDroppedTvShows(userUid).push()
        const key = newTvShowRef.key

        newTvShowRef.set({ ...item, key })
      })
    }

    addWillBeWatchingTvShows = (id, contentArr) => {
      const firebase = this.props.firebase
      const userUid = this.props.authUser.uid
      const contentExists = this.state.watchingTvShows.some(show => show.id === id)
      const allreadyWillBeWatching = this.state.willBeWatchingTvShows.some(show => show.id === id)
      const item = contentArr && contentArr.find(item => item.id === id)

      if (allreadyWillBeWatching) return
      if (contentExists) {
        toggleWatchingTvShowDataBase(firebase, id, userUid, false)
      }

      // const key =
      //   this.state.droppedTvShows.length > 0
      //     ? this.state.droppedTvShows.find(item => item.id === id).key
      //     : null

      const tvShow = this.state.droppedTvShows.find(item => item.id === id)
      const key = tvShow ? tvShow.key : null

      deleteTvShowFromSubDataBase(firebase, userUid, ["userDroppedTvShows"], key).then(() => {
        const newTvShowRef = firebase.userWillBeWatchingTvShows(userUid).push()
        const key = newTvShowRef.key

        newTvShowRef.set({ ...item, key })
      })

      // const newTvShowRef = firebase.userWillBeWatchingTvShows(userUid).push()
      // const key = newTvShowRef.key

      // newTvShowRef.set({ ...item, key })
    }

    getContent = () => {
      const firebase = this.props.firebase

      firebase.auth.onAuthStateChanged(authUser => {
        // const firebaseDb = firebase[dataBase(authUser.uid)]
        firebase.userContent(authUser.uid).on("value", snapshot => {
          const userContent = snapshot.val()
          const userWatchingTvShows = userContent && userContent.watchingtvshows
          const userDroppedTvShows = userContent && userContent.droppedtvshows
          const userWillBeWatchingTvShows = userContent && userContent.willbewatchingtvshows

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

          const willBeWatchingTvShowsList = userWillBeWatchingTvShows
            ? Object.keys(userWillBeWatchingTvShows).map(key => ({
                ...userWillBeWatchingTvShows[key],
                uid: key
              }))
            : []

          this.setState({
            watchingTvShows: watchingTvShowsList,
            droppedTvShows: droppedTvShowsList,
            willBeWatchingTvShows: willBeWatchingTvShowsList
          })
        })
      })
    }

    componentWillUnmount() {
      // this.props.firebase.userContent(this.props.authUser.uid).off()
    }

    render() {
      return <Component {...this.props} userContent={this.state} />
    }
  }
  return compose(withFirebase, WithAuthenticationConsumer)(WithUserContent)
}

export default withUserContent
