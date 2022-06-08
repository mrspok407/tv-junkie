import { ShowInfoStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { useMemo } from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { LoadedShowsInterface } from '../ReducerConfig/@Types'

type Props = {
  showsData: ShowInfoStoreState[]
  activeSection: string
  sortByState: string
  loadedShows: LoadedShowsInterface
}

const UseSortSlicedShows = ({ showsData, activeSection, sortByState, loadedShows }: Props) => {
  const { authUser, userContentLocalStorage } = useFrequentVariables()

  const sortSlicedShows = useMemo(() => {
    if (!authUser?.uid) {
      if (activeSection !== 'watchingShows') return []
      return userContentLocalStorage.watchingShows.slice(0, loadedShows.watchingShowsLS)
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
  }, [activeSection, authUser, loadedShows, showsData, sortByState, userContentLocalStorage.watchingShows])

  return sortSlicedShows
}

export default UseSortSlicedShows
