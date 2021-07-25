import React from "react"
import "./Modal.scss"

type Props = {
  message: string
}

const ModalContent: React.FC<Props> = ({ message }) => {
  return <div className="modal-message">{message}</div>
}

export default ModalContent
