export type ACTIONTYPES =
  | { type: 'handleLoading'; payload: { id: string; loading: boolean } }
  | { type: 'handleSuccess'; payload: { id: string; data: any } }
  | { type: 'handleOpenData'; payload: { id: string } }
  | { type: 'handleFailure'; payload: { id: string } }

export interface StateInterface<DataType> {
  data: DataType[]
  fetchedData: string[]
  loading: string[]
  openData: string[]
  errors: string[]
}

const reducer =
  <T,>() =>
  (state: StateInterface<T>, action: ACTIONTYPES): StateInterface<T> => {
    const { data, openData, loading, fetchedData, errors } = state

    switch (action.type) {
      case 'handleLoading': {
        const { id } = action.payload
        if (fetchedData.includes(id) || loading.includes(id)) return { ...state }
        return {
          ...state,
          loading: action.payload.loading
            ? [...loading, action.payload.id]
            : loading.filter((item) => item !== action.payload.id),
        }
      }

      case 'handleSuccess': {
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

      case 'handleOpenData': {
        return {
          ...state,
          openData: openData.includes(action.payload.id)
            ? openData.filter((item) => item !== action.payload.id)
            : [...openData, action.payload.id],
        }
      }

      case 'handleFailure': {
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
