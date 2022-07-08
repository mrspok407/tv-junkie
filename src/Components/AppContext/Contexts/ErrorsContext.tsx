import { useAppDispatch, useAppSelector } from 'app/hooks'
import { selectShowsError, setShowsError } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import React, { createContext, useCallback, useEffect, useRef, useState } from 'react'
import { ERROR_MODAL_DURATION } from 'Utils/Constants'

export interface ErrorInterface {
  errorData?: unknown
  message: string
}

export interface ErrorContextInt {
  error: ErrorInterface | null
  handleError: ({ errorData, message }: ErrorInterface) => void
}

const INITIAL_VALUE_ERRORS = {
  error: null,
  handleError: () => {},
}

export const ErrorsValueContext = createContext<ErrorContextInt['error']>(INITIAL_VALUE_ERRORS.error)
export const ErrorsHandlerContext = createContext<ErrorContextInt['handleError']>(INITIAL_VALUE_ERRORS.handleError)

export interface ErrorsProviderInt extends ErrorContextInt {
  children: React.ReactNode
}

export const ErrorsProvider = ({ error, handleError, children }: ErrorsProviderInt) => {
  return (
    <ErrorsValueContext.Provider value={error}>
      <ErrorsHandlerContext.Provider value={handleError}>{children}</ErrorsHandlerContext.Provider>
    </ErrorsValueContext.Provider>
  )
}

const useErrorsContext = () => {
  const dispatch = useAppDispatch()
  const showsError = useAppSelector(selectShowsError)

  const [error, setError] = useState<ErrorInterface | null>(null)
  const modalContainerRef = useRef<HTMLDivElement>(null!)

  const timeoutRef = useRef<number | null>(null)
  const fadeOutTimeout = useRef<number | null>(null)

  const handleError = useCallback(
    ({ errorData, message }: ErrorInterface) => {
      setError({ errorData, message })

      modalContainerRef.current?.classList.remove('modal-fade-out')
      window.clearTimeout(timeoutRef.current || 0)
      window.clearTimeout(fadeOutTimeout.current || 0)

      fadeOutTimeout.current = window.setTimeout(() => {
        const modalContainer = document.querySelector('.modal-container') as HTMLDivElement
        modalContainerRef.current = modalContainer
        modalContainer?.classList.add('modal-fade-out')
      }, ERROR_MODAL_DURATION - 300)
      timeoutRef.current = window.setTimeout(() => {
        setError(null)
        dispatch(setShowsError(null))
      }, ERROR_MODAL_DURATION)
    },
    [dispatch],
  )

  useEffect(() => {
    if (!showsError) return
    handleError({ errorData: showsError, message: 'Error in the database occured. Please reload the page.' })
  }, [showsError, handleError])

  return [error, handleError] as const
}

export default useErrorsContext
