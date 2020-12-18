import React from "react"
import { AppContext } from "./AppContextHOC"

export const AppContextConsumer = (Component: any) => (props: any) => {
  return <AppContext.Consumer>{(value) => <Component {...props} context={value} />}</AppContext.Consumer>
}

export default AppContextConsumer
