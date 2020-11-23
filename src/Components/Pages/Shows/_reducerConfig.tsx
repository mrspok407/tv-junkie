import { AppContextInterface } from "Components/AppContext/AppContextHOC"

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

const SHOWS_TO_LOAD_INITIAL = 5
const INITIAL_STATE = {
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
  activeSection: "watchingShows"
}

const reducer = (state: ShowsContentState, action: { type: string; payload: AppContextInterface }) => {
  const { loadedShows, disableLoad, activeSection, context } = state
  if (action.type === "incrementLoadedShows") {
    return {
      ...state,
      loadedShows: {
        ...loadedShows,
        [activeSection]: !disableLoad[activeSection]
          ? loadedShows[activeSection] + SHOWS_TO_LOAD_INITIAL
          : loadedShows[activeSection]
      }
    }
  } else if (action.type === "incrementLoadedShowsLS") {
    return {
      ...state,
      loadedShows: {
        ...loadedShows,
        watchingShowsLS: !disableLoad.watchingShowsLS
          ? loadedShows.watchingShowsLS + SHOWS_TO_LOAD_INITIAL
          : loadedShows.watchingShowsLS
      }
    }
  } else if (action.type === "disableLoad") {
    return {
      ...state,
      disableLoad: {
        ...disableLoad,
        [activeSection]: !!(
          loadedShows[activeSection] >=
          context.userContent.userShows.filter((show: any) =>
            activeSection === "finishedShows"
              ? !!show.finished
              : !!(show.database === activeSection && !show.finished)
          ).length
        )
      }
    }
  } else if (action.type === "disableLoadLS") {
    return {
      ...state,
      disableLoad: {
        ...disableLoad,
        watchingShowsLS: !!(
          loadedShows.watchingShowsLS >= context.userContentLocalStorage.watchingShows.length
        )
      }
    }
  } else if (action.type === "changeActiveSection") {
    return {
      ...state,
      activeSection: action.payload
    }
  } else if (action.type === "updateContext") {
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
