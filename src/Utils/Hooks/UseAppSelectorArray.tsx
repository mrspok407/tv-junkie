import { useAppSelector } from 'app/hooks'
import { RootState } from 'app/store'
import { AuthUserInterface } from 'Components/UserAuth/Session/Authentication/@Types'
import { UserShowsStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { useMemo } from 'react'

type UseAppSelectorArray<Type> = (state: RootState) => {
  [key: string]: Type
}

const useAppSelectorArray = <Type,>(selector: UseAppSelectorArray<Type>) => {
  const storeData = useAppSelector(selector)
  const storeDataArray = useMemo(() => Object.values(storeData), [storeData])
  return storeDataArray
}

export default useAppSelectorArray
