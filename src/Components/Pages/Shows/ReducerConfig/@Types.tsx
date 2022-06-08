import { ShowInfoStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'

export enum ActionTypesEnum {
  IncrementLoadedShows = 'incrementLoadedShows',
  IncrementLoadedShowsLS = 'incrementLoadedShowsLS',
  ChangeActiveSection = 'changeActiveSection',
}

export type ACTIONTYPES =
  | { type: ActionTypesEnum.IncrementLoadedShows; payload: { sectionFilteredShows: ShowInfoStoreState[] } }
  | { type: ActionTypesEnum.IncrementLoadedShowsLS; payload: { sectionFilteredShows: ShowInfoStoreState[] } }
  | { type: ActionTypesEnum.ChangeActiveSection; payload: { activeSection: string } }

export interface LoadedShowsInterface {
  [key: string]: number
  watchingShows: number
  droppedShows: number
  willWatchShows: number
  finishedShows: number
  watchingShowsLS: number
}

export interface ShowsContentState {
  loadedShows: LoadedShowsInterface
  activeSection: string
}

export const SHOWS_TO_LOAD_INITIAL = 8
export const SHOWS_TO_LOAD_ADDITIONAL = 8
export const INITIAL_STATE: ShowsContentState = {
  loadedShows: {
    watchingShows: SHOWS_TO_LOAD_INITIAL,
    watchingShowsLS: SHOWS_TO_LOAD_INITIAL,
    droppedShows: SHOWS_TO_LOAD_INITIAL,
    willWatchShows: SHOWS_TO_LOAD_INITIAL,
    finishedShows: SHOWS_TO_LOAD_INITIAL,
  },
  activeSection: 'watchingShows',
}
