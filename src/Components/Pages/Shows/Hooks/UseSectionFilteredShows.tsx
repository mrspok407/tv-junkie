import { ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { useMemo } from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  showsData: ShowFullDataStoreState[]
  activeSection: string
}

const UseSectionFilteredShows = ({ showsData, activeSection }: Props) => {
  const { authUser, userContentLocalStorage } = useFrequentVariables()
  const sectionFilteredShows = useMemo(() => {
    if (!authUser.uid) {
      return userContentLocalStorage.watchingShows
    }
    return showsData.filter((show) => {
      return activeSection === 'finishedShows' ? !!show.finished : !!(show.database === activeSection && !show.finished)
    })
  }, [showsData, activeSection, userContentLocalStorage.watchingShows, authUser])

  return sectionFilteredShows
}

export default UseSectionFilteredShows