import produce from 'immer'
import * as React from 'react'
import { ACTIONTYPES, ActionTypesEnum, ShowsContentState, SHOWS_TO_LOAD_ADDITIONAL } from './@Types'

const reducer: React.Reducer<ShowsContentState, ACTIONTYPES> = produce((draft, action) => {
  const { loadedShows, activeSection } = draft

  switch (action.type) {
    case ActionTypesEnum.IncrementLoadedShows: {
      if (loadedShows[activeSection] >= action.payload.sectionFilteredShows.length) break
      draft.loadedShows[activeSection] += SHOWS_TO_LOAD_ADDITIONAL
      break
    }

    case ActionTypesEnum.IncrementLoadedShowsLS: {
      if (loadedShows[activeSection] >= action.payload.sectionFilteredShows.length) break
      draft.loadedShows.watchingShowsLS += SHOWS_TO_LOAD_ADDITIONAL
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
