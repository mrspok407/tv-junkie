import { LocalStorageValueContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { useContext, useMemo } from 'react'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  showsData: ShowFullDataStoreState[]
  activeSection: string
}

const UseSectionFilteredShows = ({ showsData, activeSection }: Props): ShowFullDataStoreState[] | MainDataTMDB[] => {
  const { authUser } = useFrequentVariables()
  const localStorageContent = useContext(LocalStorageValueContext)
  const sectionFilteredShows = useMemo(() => {
    if (!authUser.uid) {
      return localStorageContent.watchingShows
    }
    return showsData.filter((show) => {
      return activeSection === 'finishedShows' ? !!show.finished : !!(show.database === activeSection && !show.finished)
    })
  }, [showsData, activeSection, localStorageContent, authUser])

  return sectionFilteredShows
}

export default UseSectionFilteredShows
