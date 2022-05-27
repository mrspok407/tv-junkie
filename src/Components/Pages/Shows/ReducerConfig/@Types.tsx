import { AppContextInterface, CONTEXT_INITIAL_STATE } from 'Components/AppContext/@Types'
import { UserShowsInterface } from 'Components/UserContent/UseUserShowsRed/@Types'

export enum ActionTypesEnum {
  IncrementLoadedShows = 'incrementLoadedShows',
  IncrementLoadedShowsLS = 'incrementLoadedShowsLS',
  DisableLoad = 'disableLoad',
  DisableLoadLS = 'disableLoadLS',
  ChangeActiveSection = 'changeActiveSection',
  UpdateContext = 'updateContext',
}

export type ACTIONTYPES =
  | { type: ActionTypesEnum.IncrementLoadedShows }
  | { type: ActionTypesEnum.IncrementLoadedShowsLS }
  | { type: ActionTypesEnum.DisableLoad; payload: { userShows: UserShowsInterface[] } }
  | { type: ActionTypesEnum.DisableLoadLS }
  | { type: ActionTypesEnum.ChangeActiveSection; payload: { activeSection: string } }
  | { type: ActionTypesEnum.UpdateContext; payload: { context: AppContextInterface } }

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

export const SHOWS_TO_LOAD_INITIAL = 16
export const INITIAL_STATE: ShowsContentState = {
  disableLoad: {
    watchingShows: false,
    droppedShows: false,
    willWatchShows: false,
    finishedShows: false,
    watchingShowsLS: false,
  },
  loadedShows: {
    watchingShows: SHOWS_TO_LOAD_INITIAL,
    watchingShowsLS: SHOWS_TO_LOAD_INITIAL,
    droppedShows: SHOWS_TO_LOAD_INITIAL,
    willWatchShows: SHOWS_TO_LOAD_INITIAL,
    finishedShows: SHOWS_TO_LOAD_INITIAL,
  },
  activeSection: 'watchingShows',
  context: CONTEXT_INITIAL_STATE,
}
