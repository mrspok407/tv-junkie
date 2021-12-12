import * as React from "react"
import { AppContextInterface, CONTEXT_INITIAL_STATE } from "Components/AppContext/@Types"

export enum ActionTypes {
  IncrementLoadedShows = "incrementLoadedShows",
  IncrementLoadedShowsLS = "incrementLoadedShowsLS",
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
  watchingShows: boolean
  droppedShows: boolean
  willWatchShows: boolean
  finishedShows: boolean
  watchingShowsLS: boolean
}

interface LoadedShowsInterface {
  [key: string]: number
  watchingShows: number
  droppedShows: number
  willWatchShows: number
  finishedShows: number
  watchingShowsLS: number
}

export interface ShowsContentState {
  loadedShows: LoadedShowsInterface
  disableLoad: DisableLoadInterface
  activeSection: string
  context: AppContextInterface
}

const SHOWS_TO_LOAD_INITIAL = 16
const INITIAL_STATE: ShowsContentState = {
  disableLoad: {
    watchingShows: false,
    droppedShows: false,
    willWatchShows: false,
    finishedShows: false,
    watchingShowsLS: false
  },
  loadedShows: {
    watchingShows: SHOWS_TO_LOAD_INITIAL,
    watchingShowsLS: SHOWS_TO_LOAD_INITIAL,
    droppedShows: SHOWS_TO_LOAD_INITIAL,
    willWatchShows: SHOWS_TO_LOAD_INITIAL,
    finishedShows: SHOWS_TO_LOAD_INITIAL
  },
  activeSection: "watchingShows",
  context: CONTEXT_INITIAL_STATE
}

const reducer: React.Reducer<ShowsContentState, ActionInterface> = (state, action) => {
  const { loadedShows, disableLoad, activeSection, context } = state
  if (action.type === ActionTypes.IncrementLoadedShows) {
    return {
      ...state,
      loadedShows: {
        ...loadedShows,
        [activeSection]: !disableLoad[activeSection]
          ? loadedShows[activeSection] + SHOWS_TO_LOAD_INITIAL
          : loadedShows[activeSection]
      }
    }
  } else if (action.type === ActionTypes.IncrementLoadedShowsLS) {
    return {
      ...state,
      loadedShows: {
        ...loadedShows,
        watchingShowsLS: !disableLoad.watchingShowsLS
          ? loadedShows.watchingShowsLS + SHOWS_TO_LOAD_INITIAL
          : loadedShows.watchingShowsLS
      }
    }
  } else if (action.type === ActionTypes.DisableLoad) {
    return {
      ...state,
      disableLoad: {
        ...disableLoad,
        [activeSection]: !!(
          loadedShows[activeSection] >=
          context.userContent.userShows.filter((show: any) =>
            activeSection === "finishedShows" ? !!show.finished : !!(show.database === activeSection && !show.finished)
          ).length
        )
      }
    }
  } else if (action.type === ActionTypes.DisableLoadLS) {
    return {
      ...state,
      disableLoad: {
        ...disableLoad,
        watchingShowsLS: !!(loadedShows.watchingShowsLS >= context.userContentLocalStorage.watchingShows.length)
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
