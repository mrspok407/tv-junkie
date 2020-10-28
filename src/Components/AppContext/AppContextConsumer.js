import React from "react"
import { AppContext } from "./AppContextHOC"

export const AppContextConsumer = (Component) => (props) => {
  return <AppContext.Consumer>{(value) => <Component {...props} context={value} />}</AppContext.Consumer>
}

export default AppContextConsumer
