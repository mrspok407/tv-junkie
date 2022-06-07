import { useAppSelector } from 'app/hooks'
import { AuthUserInterface } from 'Components/UserAuth/Session/WithAuthentication/@Types'
import { UserShowsStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { useMemo } from 'react'

type UseAppSelectorArray<Type> = (state: { userShows: UserShowsStoreState; authUser: AuthUserInterface }) => {
  [key: string]: Type
}

const useAppSelectorArray = <Type,>(selector: UseAppSelectorArray<Type>) => {
  const storeData = useAppSelector(selector)
  const storeDataArray = useMemo(() => Object.values(storeData), [storeData])
  return storeDataArray
}

export default useAppSelectorArray
