import { LocalStorageValueContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { MovieFullDataStoreState } from 'Components/UserContent/UseUserMoviesRed/@Types'
import { useContext, useMemo } from 'react'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  moviesData: MovieFullDataStoreState[]
  activeSection: string
}

const UseSectionFilteredMovies = ({ moviesData, activeSection }: Props): MovieFullDataStoreState[] | MainDataTMDB[] => {
  const { authUser } = useFrequentVariables()
  const localStorageContent = useContext(LocalStorageValueContext)
  const sectionFilteredMovies = useMemo(() => {
    if (!authUser.uid) {
      return localStorageContent.watchLaterMovies
    }
    return moviesData.filter((movie) => {
      return activeSection === 'finishedMovies'
        ? !!movie.finished
        : !!(movie.database === activeSection && !movie.finished)
    })
  }, [moviesData, activeSection, localStorageContent, authUser])

  return sectionFilteredMovies
}

export default UseSectionFilteredMovies
