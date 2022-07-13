export enum ActionTypesEnum {
  HandleLoading = 'handleLoading',
  HandleSuccess = 'handleSuccess',
  HandleOpenData = 'handleOpenData',
  HandleFailure = 'handleFailure',
}

export type ACTIONTYPES =
  | { type: ActionTypesEnum.HandleLoading; payload: { seasonId: number } }
  | { type: ActionTypesEnum.HandleSuccess; payload: { seasonId: number; data: any } }
  | { type: ActionTypesEnum.HandleOpenData; payload: { seasonId: number } }
  | { type: ActionTypesEnum.HandleFailure; payload: { seasonId: number } }

export interface FetchSeasonsInt<DataType> {
  data: DataType[]
  fetchedData: number[]
  loading: number[]
  openData: number[]
  errors: number[]
}

export const FETCH_SEASONS_INITIAL_STATE = {
  data: [],
  fetchedData: [],
  loading: [],
  openData: [],
  errors: [],
}
