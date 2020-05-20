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

      this.toggleContent = (id, contentArr) => {
        const newSelectedContent = [...this.state.selectedContent]
        const indexInSelected = newSelectedContent.findIndex(e => e.id === id)

        if (indexInSelected !== -1) {
          newSelectedContent.splice(indexInSelected, 1)
          this.setState({
            selectedContent: newSelectedContent
          })
        } else {
          const indexInContentArr = contentArr.findIndex(e => e.id === id)
          const content = contentArr[indexInContentArr]
          this.setState({
            selectedContent: [content, ...newSelectedContent]
          })
        }

        this.props.firebase.auth.onAuthStateChanged(authUser => {
          const item = contentArr.find(item => item.id === id)
          let movieExist

          this.props.firebase
            .userMovies(authUser.uid)
            .orderByChild("id")
            .equalTo(id)
            .once("value", snapshot => {
              movieExist = snapshot.val() !== null
            })
            .then(() => {
              if (movieExist) {
                this.props.firebase
                  .userMovies(authUser.uid)
                  .orderByChild("id")
                  .equalTo(id)
                  .once("value", snapshot => {
                    const updates = {}
                    snapshot.forEach(child => (updates[child.key] = null))
                    this.props.firebase.userMovies(authUser.uid).update(updates)
                  })
              } else {
                this.props.firebase
                  .userMovies(authUser.uid)
                  .push()
                  .set(item)
              }
            })
        })
      }

      this.clearSelectedContent = () => {
        this.setState({
          selectedContent: []
        })
      }

      this.state = {
        selectedContent: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CONTENT)) || [],
        toggleContent: this.toggleContent,
        clearSelectedContent: this.clearSelectedContent
      }
    }

    componentDidUpdate() {
      localStorage.setItem(LOCAL_STORAGE_KEY_CONTENT, JSON.stringify(this.state.selectedContent))
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
