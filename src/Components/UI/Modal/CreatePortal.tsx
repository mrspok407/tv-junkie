import React, { useEffect, useRef } from "react"
import { createPortal } from "react-dom"

type Props = {
  element: React.ReactNode
}

const CreatePortal: React.FC<Props> = ({ element }) => {
  const el = useRef(document.createElement("div"))

  useEffect(() => {
    const modalRoot = document.querySelector(".container")
    const current = el.current
    current.classList.add("modal-container")

    modalRoot!.appendChild(current)
    return () => void modalRoot!.removeChild(current)
  }, [])

  return createPortal(element, el.current)
}

export default CreatePortal
