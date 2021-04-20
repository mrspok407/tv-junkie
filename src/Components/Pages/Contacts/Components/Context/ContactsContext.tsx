import React, { useReducer, createContext } from "react"
import { ContactsStateInterface } from "../../Types"
import reducer, { INITIAL_STATE, ACTIONTYPES } from "./_reducerConfig"

interface ContextInterface {
  state: ContactsStateInterface
  dispatch: React.Dispatch<ACTIONTYPES>
}

export const ContactsContext = createContext<ContextInterface | null>(null)

const ContactsContextHOC = (Component: any) =>
  function Comp(props: any) {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
    return (
      <ContactsContext.Provider value={{ state, dispatch }}>
        <Component {...props} />
      </ContactsContext.Provider>
    )
  }

export default ContactsContextHOC
