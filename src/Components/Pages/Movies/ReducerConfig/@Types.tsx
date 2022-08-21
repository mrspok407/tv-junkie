import { MovieInfoStoreState } from 'Components/UserContent/UseUserMoviesRed/@Types'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

export type SortByOptionsType = 'title' | 'timeStamp'
export enum MovieSectionOptions {
  WatchLater = 'watchLaterMovies',
  Finished = 'finishedMovies',
}

export enum ActionTypesEnum {
  IncrementLoadedMovies = 'incrementLoadedMovies',
  IncrementLoadedMoviesLS = 'incrementLoadedMoviesLS',
  ChangeActiveSection = 'changeActiveSection',
}

export type ACTIONTYPES =
  | {
      type: ActionTypesEnum.IncrementLoadedMovies
      payload: {
        sectionFilteredMovies: MovieInfoStoreState[] | MainDataTMDB[]
      }
    }
  | {
      type: ActionTypesEnum.IncrementLoadedMoviesLS
      payload: { sectionFilteredMovies: MovieInfoStoreState[] | MainDataTMDB[] }
    }
  | { type: ActionTypesEnum.ChangeActiveSection; payload: { activeSection: MovieSectionOptions } }

export interface LoadedMoviesInterface {
  [key: string]: number
  watchLaterMovies: number
  watchLaterMoviesLS: number
  finishedMovies: number
}

export interface MoviesContentState {
  loadedMovies: LoadedMoviesInterface
  activeSection: MovieSectionOptions
}

export const MOVIES_TO_LOAD_INITIAL = 8
export const MOVIES_TO_LOAD_ADDITIONAL = 8
export const INITIAL_STATE: MoviesContentState = {
  loadedMovies: {
    watchLaterMovies: MOVIES_TO_LOAD_INITIAL,
    watchLaterMoviesLS: MOVIES_TO_LOAD_INITIAL,
    finishedMovies: MOVIES_TO_LOAD_INITIAL,
  },
  activeSection: MovieSectionOptions.WatchLater,
}
