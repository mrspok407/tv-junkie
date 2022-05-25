import { useAppSelector } from 'app/hooks'
import { AuthUserInterface } from 'Components/UserAuth/Session/WithAuthentication/@Types'
import { UserShowsState } from 'Components/UserContent/UseUserShowsRed/@Types'

type UseAppSelectorArray<Type> = (state: { userShows: UserShowsState; authUser: AuthUserInterface }) => {
  [key: string]: Type
}

const useAppSelectorArray = <Type,>(selector: UseAppSelectorArray<Type>) => {
  const storeData = useAppSelector(selector)
  const storeDataArray = Object.values(storeData)
  return storeDataArray
}

export default useAppSelectorArray
