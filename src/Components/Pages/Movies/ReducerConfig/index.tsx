import produce from 'immer'
import * as React from 'react'
import { ACTIONTYPES, ActionTypesEnum, MoviesContentState, MOVIES_TO_LOAD_ADDITIONAL } from './@Types'

const reducer: React.Reducer<MoviesContentState, ACTIONTYPES> = produce((draft, action) => {
  const { loadedMovies, activeSection } = draft

  switch (action.type) {
    case ActionTypesEnum.IncrementLoadedMovies: {
      if (loadedMovies[activeSection] >= action.payload.sectionFilteredMovies.length) break
      draft.loadedMovies[activeSection] += MOVIES_TO_LOAD_ADDITIONAL
      break
    }

    case ActionTypesEnum.IncrementLoadedMoviesLS: {
      if (loadedMovies[activeSection] >= action.payload.sectionFilteredMovies.length) break
      draft.loadedMovies.watchingMoviesLS += MOVIES_TO_LOAD_ADDITIONAL
      break
    }

    case ActionTypesEnum.ChangeActiveSection: {
      draft.activeSection = action.payload.activeSection
      break
    }

    default:
      break
  }
})

export default reducer
