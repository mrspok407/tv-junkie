import * as React from "react"
import { AppContextInterface, CONTEXT_INITIAL_STATE } from "Components/AppContext/@Types"

export enum ActionTypes {
  IncrementLoadedMovies = "incrementLoadedMovies",
  IncrementLoadedMoviesLS = "incrementLoadedMoviesLS",
  DisableLoad = "disableLoad",
  DisableLoadLS = "disableLoadLS",
  ChangeActiveSection = "changeActiveSection",
  UpdateContext = "updateContext"
}

export interface ActionInterface {
  type: ActionTypes
  payload?: any
}

interface DisableLoadInterface {
  [key: string]: boolean
  watchLaterMovies: boolean
  watchLaterMoviesLS: boolean
}

interface LoadedMoviesInterface {
  [key: string]: number
  watchLaterMovies: number
  watchLaterMoviesLS: number
}

export interface MoviesContentState {
  loadedMovies: LoadedMoviesInterface
  disableLoad: DisableLoadInterface
  activeSection: string
  context: AppContextInterface
}

const MOVIES_TO_LOAD_INITIAL = 16
const INITIAL_STATE: MoviesContentState = {
  disableLoad: {
    watchLaterMovies: false,
    watchLaterMoviesLS: false
  },
  loadedMovies: {
    watchLaterMovies: MOVIES_TO_LOAD_INITIAL,
    watchLaterMoviesLS: MOVIES_TO_LOAD_INITIAL
  },
  activeSection: "watchLaterMovies",
  context: CONTEXT_INITIAL_STATE
}

const reducer: React.Reducer<MoviesContentState, ActionInterface> = (state, action) => {
  const { loadedMovies, disableLoad, activeSection, context } = state
  if (action.type === ActionTypes.IncrementLoadedMovies) {
    return {
      ...state,
      loadedMovies: {
        ...loadedMovies,
        [activeSection]: !disableLoad[activeSection]
          ? loadedMovies[activeSection] + MOVIES_TO_LOAD_INITIAL
          : loadedMovies[activeSection]
      }
    }
  } else if (action.type === ActionTypes.IncrementLoadedMoviesLS) {
    return {
      ...state,
      loadedMovies: {
        ...loadedMovies,
        watchLaterMoviesLS: !disableLoad.watchLaterMoviesLS
          ? loadedMovies.watchLaterMoviesLS + MOVIES_TO_LOAD_INITIAL
          : loadedMovies.watchLaterMoviesLS
      }
    }
  } else if (action.type === ActionTypes.DisableLoad) {
    return {
      ...state,
      disableLoad: {
        ...disableLoad,
        [activeSection]: !!(loadedMovies[activeSection] >= context.userContent.userMovies.length)
      }
    }
  } else if (action.type === ActionTypes.DisableLoadLS) {
    return {
      ...state,
      disableLoad: {
        ...disableLoad,
        watchLaterMoviesLS: !!(
          loadedMovies.watchLaterMoviesLS >= context.userContentLocalStorage.watchLaterMovies.length
        )
      }
    }
  } else if (action.type === ActionTypes.ChangeActiveSection) {
    return {
      ...state,
      activeSection: action.payload
    }
  } else if (action.type === ActionTypes.UpdateContext) {
    return {
      ...state,
      context: action.payload
    }
  } else {
    throw new Error()
  }
}

export default reducer
export { INITIAL_STATE }
