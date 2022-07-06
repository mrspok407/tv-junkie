/* eslint-disable react/jsx-props-no-spreading */
import React, { createContext, useState } from 'react'
import useErrorsContext, { ErrorsProvider } from './Contexts/ErrorsContext'
import useContactsActivityContext, { ContactsActivityContext } from './Contexts/ContactsActivityContext'
import useLocalStorageContext, {
  LocalStorageProvider,
} from './Contexts/LocalStorageContentContext/LocalStorageContentContext'

export const TestAppContext = createContext(0)

const ContextsWrapper = ({ children }: { children: React.ReactNode }) => {
  const [counter, setCounter] = useState(0)

  const [errorContextValue, handleError] = useErrorsContext()
  const contactsActivityContextValue = useContactsActivityContext()

  const [localStorageContextValue, localStorageHandlers] = useLocalStorageContext()

  return (
    <LocalStorageProvider data={localStorageContextValue} handlers={localStorageHandlers}>
      <ErrorsProvider error={errorContextValue} handleError={handleError}>
        <ContactsActivityContext.Provider value={contactsActivityContextValue}>
          <button type="button" onClick={() => setCounter(counter + 1)}>
            Counter++
          </button>
          {children}
          {/* <App /> */}
        </ContactsActivityContext.Provider>
      </ErrorsProvider>
    </LocalStorageProvider>
  )
}

export default ContextsWrapper
