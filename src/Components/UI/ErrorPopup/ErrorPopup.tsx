import React, { useContext } from 'react'
import { ErrorsContext } from 'Components/AppContext/Contexts/ErrorsContext'
import CreatePortal from '../Modal/CreatePortal'
import ModalContent from '../Modal/ModalContent'

const ErrorPopup = () => {
  const errors = useContext(ErrorsContext)
  return errors && <CreatePortal element={<ModalContent message={errors.message} />} />
}

export default ErrorPopup
