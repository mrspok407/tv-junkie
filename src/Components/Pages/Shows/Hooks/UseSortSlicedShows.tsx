import { LocalStorageValueContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { useContext, useMemo } from 'react'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { LoadedShowsInterface } from '../ReducerConfig/@Types'

type Props = {
  showsData: ShowFullDataStoreState[] | MainDataTMDB[]
  activeSection: string
  sortByState: string
  loadedShows: LoadedShowsInterface
}

const UseSortSlicedShows = ({ showsData, activeSection, sortByState, loadedShows }: Props) => {
  const { authUser } = useFrequentVariables()
  const localStorageContent = useContext(LocalStorageValueContext)

  const sortSlicedShows = useMemo(() => {
    if (!authUser?.uid) {
      if (activeSection !== 'watchingShows') return []
      return localStorageContent.watchingShows.slice(0, loadedShows.watchingShowsLS)
    }
    return showsData
      .sort((a: any, b: any) => {
        if (a[sortByState] > b[sortByState]) {
          if (sortByState === 'timeStamp') return -1
          return 1
        }
        if (sortByState !== 'timeStamp') return -1
        return 1
      })
      .slice(0, loadedShows[activeSection])
  }, [activeSection, authUser, loadedShows, showsData, sortByState, localStorageContent])

  return sortSlicedShows
}

export default UseSortSlicedShows
