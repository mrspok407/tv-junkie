import React from "react"
import SelectedContentContext from "./SelectedContentContext"

const withSelectedContextConsumer = Component => props => (
  <SelectedContentContext.Consumer>
    {selectedContent => <Component {...props} selectedContentState={selectedContent} />}
  </SelectedContentContext.Consumer>
)

export default withSelectedContextConsumer
