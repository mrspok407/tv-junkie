import React from 'react'
import './Modal.scss'

type Props = {
  message: string
}

const ModalContent: React.FC<Props> = ({ message }) => <div className="modal-message">{message}</div>

export default ModalContent
