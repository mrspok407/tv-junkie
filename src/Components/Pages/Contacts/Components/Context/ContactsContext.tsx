import React, { useReducer, createContext } from "react"
import { ContactsStateInterface } from "../../Types"
import reducer, { INITIAL_STATE, ActionInterface } from "./_reducerConfig"

interface ContextInterface {
  state: ContactsStateInterface
  dispatch: React.Dispatch<ActionInterface>
}

export const ContactsContext = createContext<ContextInterface | null>(null)

const ContactsContextHOC = (Component: any) =>
  function Comp(props: any) {
    const [state, dispatch] = useReducer<React.Reducer<ContactsStateInterface, ActionInterface>>(reducer, INITIAL_STATE)

    const ContextValue: ContextInterface = {
      state: { ...state },
      dispatch: dispatch
    }

    return (
      <ContactsContext.Provider value={ContextValue}>
        <Component {...props} />
      </ContactsContext.Provider>
    )
  }

export default ContactsContextHOC
