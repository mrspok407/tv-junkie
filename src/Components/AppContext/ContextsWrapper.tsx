import React from 'react'
import useErrorsContext, { ErrorsProvider } from './Contexts/ErrorsContext'
import useContactsActivityContext, { ContactsActivityContext } from './Contexts/ContactsActivityContext'
import useLocalStorageContext, {
  LocalStorageProvider,
} from './Contexts/LocalStorageContentContext/LocalStorageContentContext'

const ContextsWrapper = ({ children }: { children: React.ReactNode }) => {
  const [errorContextValue, handleError] = useErrorsContext()
  const [localStorageContextValue, localStorageHandlers] = useLocalStorageContext()
  const contactsActivityContextValue = useContactsActivityContext()

  return (
    <LocalStorageProvider data={localStorageContextValue} handlers={localStorageHandlers}>
      <ErrorsProvider error={errorContextValue} handleError={handleError}>
        <ContactsActivityContext.Provider value={contactsActivityContextValue}>
          {children}
        </ContactsActivityContext.Provider>
      </ErrorsProvider>
    </LocalStorageProvider>
  )
}

export default ContextsWrapper
