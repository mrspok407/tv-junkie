export enum ActionTypesEnum {
  HandleLoading = 'handleLoading',
  HandleSuccess = 'handleSuccess',
  HandleOpenData = 'handleOpenData',
  HandleFailure = 'handleFailure',
  HandleCloseAll = 'handleCloseAll',
}

export type ACTIONTYPES =
  | { type: ActionTypesEnum.HandleLoading; payload: { seasonId: number } }
  | { type: ActionTypesEnum.HandleSuccess; payload: { seasonId: number; data: any; isSideEffect: boolean } }
  | { type: ActionTypesEnum.HandleOpenData; payload: { seasonId: number } }
  | { type: ActionTypesEnum.HandleFailure; payload: { seasonId: number } }
  | { type: ActionTypesEnum.HandleCloseAll }

export interface FetchSeasonsInt<DataType> {
  data: DataType[]
  fetchedData: number[]
  loadingData: number[]
  openData: number[]
  errors: number[]
}

export const FETCH_SEASONS_INITIAL_STATE = {
  data: [],
  fetchedData: [],
  loadingData: [],
  openData: [],
  errors: [],
}
