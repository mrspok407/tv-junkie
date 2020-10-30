import React, { createContext } from "react"

interface FirebaseContextInterface {
  showEpisodes: (id: number | string) => void
}

const FirebaseContext = createContext<FirebaseContextInterface>({
  showEpisodes: () => {}
})

export const withFirebase = (Component: any) => (props: any) => {
  // const ContextValue: FirebaseContextInterface = {
  //   userContentLocalStorage: useUserContentLocalStorage(),
  //   userContent: useUserShows(props.firebase)
  // }
  return (
    <FirebaseContext.Consumer>
      {(firebase) => <Component {...props} firebase={firebase} />}
    </FirebaseContext.Consumer>
  )
}

export default FirebaseContext
