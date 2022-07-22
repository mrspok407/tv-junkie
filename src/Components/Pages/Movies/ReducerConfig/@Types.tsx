import { MovieFullDataStoreState } from 'Components/UserContent/UseUserMoviesRed/@Types'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

export enum ActionTypesEnum {
  IncrementLoadedMovies = 'incrementLoadedMovies',
  IncrementLoadedMoviesLS = 'incrementLoadedMoviesLS',
  ChangeActiveSection = 'changeActiveSection',
}

export type ACTIONTYPES =
  | {
      type: ActionTypesEnum.IncrementLoadedMovies
      payload: { sectionFilteredMovies: MovieFullDataStoreState[] | MainDataTMDB[] }
    }
  | {
      type: ActionTypesEnum.IncrementLoadedMoviesLS
      payload: { sectionFilteredMovies: MovieFullDataStoreState[] | MainDataTMDB[] }
    }
  | { type: ActionTypesEnum.ChangeActiveSection; payload: { activeSection: string } }

export interface LoadedMoviesInterface {
  [key: string]: number
  watchLaterMovies: number
  watchLaterMoviesLS: number
  finishedMovies: number
}

export interface MoviesContentState {
  loadedMovies: LoadedMoviesInterface
  activeSection: string
}

export const MOVIES_TO_LOAD_INITIAL = 8
export const MOVIES_TO_LOAD_ADDITIONAL = 8
export const INITIAL_STATE: MoviesContentState = {
  loadedMovies: {
    watchLaterMovies: MOVIES_TO_LOAD_INITIAL,
    watchLaterMoviesLS: MOVIES_TO_LOAD_INITIAL,
    finishedMovies: MOVIES_TO_LOAD_INITIAL,
  },
  activeSection: 'watchLaterMovies',
}
