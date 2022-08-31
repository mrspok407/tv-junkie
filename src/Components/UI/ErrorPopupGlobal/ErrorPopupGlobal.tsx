import React, { useContext } from 'react'
import { ErrorsValueContext } from 'Components/AppContext/Contexts/ErrorsContext'
import CreatePortal from '../Modal/CreatePortal'
import ModalContent from '../Modal/ModalContent'

const ErrorPopupGlobal = () => {
  const errors = useContext(ErrorsValueContext)
  return errors && <CreatePortal element={<ModalContent message={errors.message} />} />
}

export default ErrorPopupGlobal
