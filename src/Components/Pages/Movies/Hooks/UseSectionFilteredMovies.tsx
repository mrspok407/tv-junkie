import { LocalStorageValueContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { MovieInfoStoreState } from 'Components/UserContent/UseUserMoviesRed/@Types'
import { useContext, useMemo } from 'react'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { MovieSectionOptions } from '../ReducerConfig/@Types'

type Props = {
  moviesData: MovieInfoStoreState[]
  activeSection: string
  hideFinished?: boolean
}

const useSectionFilteredMovies = ({
  moviesData,
  activeSection,
  hideFinished = false,
}: Props): MovieInfoStoreState[] | MainDataTMDB[] => {
  const { authUser } = useFrequentVariables()
  const localStorageContent = useContext(LocalStorageValueContext)

  const sectionFilteredMovies = useMemo(() => {
    if (!authUser.uid) {
      return localStorageContent.watchLaterMovies
    }
    return moviesData.filter((movie) => {
      if (activeSection === MovieSectionOptions.Finished) {
        return movie.finished
      } else {
        if (hideFinished) return !movie.finished
        return movie
      }
    })
  }, [moviesData, activeSection, hideFinished, localStorageContent, authUser])

  return sectionFilteredMovies
}

export default useSectionFilteredMovies
