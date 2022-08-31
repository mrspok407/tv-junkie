import { useAppDispatch, useAppSelector } from 'app/hooks'
import { handleShowsError } from 'Components/UserContent/UseUserShowsRed/ErrorHandlers/handleShowsError'
import { fetchShowEpisodes } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/FetchData/fetchShowsData'
import { selectShowsLoading } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { useState, useEffect, useCallback } from 'react'
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
    try {
      if (mediaType !== 'show' || showsInitialLoading) return
      dispatch(fetchShowEpisodes(Number(id), firebase))
    } catch (err) {
      dispatch(handleShowsError(err))
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
