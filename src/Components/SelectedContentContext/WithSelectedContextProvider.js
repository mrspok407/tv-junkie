import React from "react"
import SelectedContentContext from "./SelectedContentContext"

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
  return WithSelectedContextProvider
}

export default withSelectedContextProvider
