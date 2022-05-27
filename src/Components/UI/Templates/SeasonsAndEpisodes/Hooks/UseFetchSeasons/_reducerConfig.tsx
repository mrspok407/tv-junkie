import * as React from 'react'

export enum ActionTypesEnum {
  HandleLoading = 'handleLoading',
  HandleSuccess = 'handleSuccess',
  HandleOpenData = 'handleOpenData',
  HandleFailure = 'handleFailure',
}

export type ACTIONTYPES =
  | { type: ActionTypesEnum.HandleLoading; payload: { id: string; loading: boolean } }
  | { type: ActionTypesEnum.HandleSuccess; payload: { id: string; data: any } }
  | { type: ActionTypesEnum.HandleOpenData; payload: { id: string } }
  | { type: ActionTypesEnum.HandleFailure; payload: { id: string } }

export interface StateInterface<DataType> {
  data: DataType[]
  fetchedData: string[]
  loading: string[]
  openData: string[]
  errors: string[]
}

const reducer =
  <T,>(): React.Reducer<StateInterface<T>, ACTIONTYPES> =>
  (state, action): StateInterface<T> => {
    const { data, openData, loading, fetchedData, errors } = state

    switch (action.type) {
      case ActionTypesEnum.HandleLoading: {
        const { id } = action.payload
        if (fetchedData.includes(id) || loading.includes(id)) return { ...state }
        return {
          ...state,
          loading: action.payload.loading
            ? [...loading, action.payload.id]
            : loading.filter((item) => item !== action.payload.id),
        }
      }

      case ActionTypesEnum.HandleSuccess: {
        if (fetchedData.includes(action.payload.id)) {
          return {
            ...state,
            openData: openData.includes(action.payload.id)
              ? openData.filter((item) => item !== action.payload.id)
              : [...openData, action.payload.id],
          }
        }

        return {
          ...state,
          loading: loading.filter((item) => item !== action.payload.id),
          data: [...data, action.payload.data],
          fetchedData: [...fetchedData, action.payload.id],
          openData: [...openData, action.payload.id],
        }
      }

      case ActionTypesEnum.HandleOpenData: {
        return {
          ...state,
          openData: openData.includes(action.payload.id)
            ? openData.filter((item) => item !== action.payload.id)
            : [...openData, action.payload.id],
        }
      }

      case ActionTypesEnum.HandleFailure: {
        return {
          ...state,
          loading: loading.filter((item) => item !== action.payload.id),
          errors: [...errors, action.payload.id],
        }
      }

      default:
        throw new Error()
    }
  }

export const INITIAL_STATE = {
  data: [],
  fetchedData: [],
  loading: [],
  openData: [],
  errors: [],
}

export default reducer
