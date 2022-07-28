import { LocalStorageValueContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { MovieInfoStoreState } from 'Components/UserContent/UseUserMoviesRed/@Types'
import { useContext, useMemo } from 'react'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { LoadedMoviesInterface, MovieSectionOptions } from '../ReducerConfig/@Types'

type Props = {
  moviesData: MovieInfoStoreState[] | MainDataTMDB[]
  activeSection: string
  sortByState: string
  loadedMovies: LoadedMoviesInterface
}

const useSortSlicedMovies = ({ moviesData, activeSection, sortByState, loadedMovies }: Props) => {
  const { authUser } = useFrequentVariables()
  const localStorageContent = useContext(LocalStorageValueContext)

  const sortSlicedMovies = useMemo(() => {
    if (!authUser?.uid) {
      if (activeSection === MovieSectionOptions.Finished) return []
      return localStorageContent.watchLaterMovies.slice(0, loadedMovies.watchLaterMoviesLS)
    }
    return moviesData
      .sort((a: any, b: any) => {
        if (a[sortByState] > b[sortByState]) {
          if (sortByState === 'timeStamp') return -1
          return 1
        }
        if (sortByState !== 'timeStamp') return -1
        return 1
      })
      .slice(0, loadedMovies[activeSection])
  }, [activeSection, authUser, loadedMovies, moviesData, sortByState, localStorageContent])

  return sortSlicedMovies
}

export default useSortSlicedMovies
