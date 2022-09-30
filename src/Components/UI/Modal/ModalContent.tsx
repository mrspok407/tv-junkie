import React from 'react'
import { useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom'
import './Modal.scss'

type Props = {
  message: string
}

const ModalContent: React.FC<Props> = ({ message }) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const location = useLocation()

  const navigationType = useNavigationType()
  console.log(location.state)

  const params = []
  for (const entry of searchParams.entries()) {
    params.push(entry)
  }

  console.log(params)

  const handleClick = () => {
    // setSearchParams({
    //   lastName: 'bob',
    // })
    if (navigationType === 'POP') {
      navigate('..')
    } else if (navigationType === 'PUSH') {
      navigate(-1)
    }
  }

  return (
    <div onClick={handleClick} className="modal-message">
      {message}
    </div>
  )
}

export default ModalContent
