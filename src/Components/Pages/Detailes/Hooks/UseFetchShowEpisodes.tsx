import { useAppDispatch, useAppSelector } from 'app/hooks'
import { fetchShowEpisodes } from 'Components/UserContent/UseUserShowsRed/Middleware/FetchData/fetchShowsData'
import { selectShowsLoading, setShowsError } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import React, { useState, useEffect, useCallback } from 'react'
import { ErrorInterface } from 'Utils/Hooks/UseErrors/UseErrors'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  mediaType: string
  id: string | number
}

const useFetchShowEpisodes = ({ mediaType, id }: Props) => {
  const { firebase } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const showsInitialLoading = useAppSelector(selectShowsLoading)
  const [loadingFireEpisodes, setLoadingFireEpisodes] = useState(true)

  const handleFetch = useCallback(async () => {
    if (mediaType !== 'show' || showsInitialLoading) return

    try {
      await dispatch(fetchShowEpisodes(Number(id), firebase))
    } catch (err) {
      const error = err as ErrorInterface
      dispatch(setShowsError(error))
    } finally {
      setLoadingFireEpisodes(false)
    }
  }, [id, mediaType, showsInitialLoading, firebase, dispatch])

  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  return { loadingFireEpisodes }
}

export default useFetchShowEpisodes
