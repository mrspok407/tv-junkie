export interface SnapshotVal<Type> {
  val(): Type | null
  key: string
}

export const setSnapshotValInitial = <T,>(initialState: T) => {
  return { val: () => initialState, key: '' }
}
