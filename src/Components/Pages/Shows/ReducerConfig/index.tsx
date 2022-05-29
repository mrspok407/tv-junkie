import produce, { current } from 'immer'
import * as React from 'react'
import { ACTIONTYPES, ActionTypesEnum, ShowsContentState, SHOWS_TO_LOAD_INITIAL } from './@Types'

const reducer: React.Reducer<ShowsContentState, ACTIONTYPES> = produce((draft, action) => {
  const { loadedShows, disableLoad, activeSection, context } = draft

  switch (action.type) {
    case ActionTypesEnum.IncrementLoadedShows: {
      console.log({ draft: current(draft) })
      if (!disableLoad[activeSection]) {
        draft.loadedShows[activeSection] += SHOWS_TO_LOAD_INITIAL
      }
      break
      // return {
      //   ...state,
      //   loadedShows: {
      //     ...loadedShows,
      //     [activeSection]: !disableLoad[activeSection]
      //       ? loadedShows[activeSection] + SHOWS_TO_LOAD_INITIAL
      //       : loadedShows[activeSection],
      //   },
      // }
    }

    case ActionTypesEnum.IncrementLoadedShowsLS: {
      if (!disableLoad.watchingShowsLS) {
        draft.loadedShows.watchingShowsLS += SHOWS_TO_LOAD_INITIAL
      }
      break
      // return {
      //   ...state,
      //   loadedShows: {
      //     ...loadedShows,
      //     watchingShowsLS: !disableLoad.watchingShowsLS
      //       ? loadedShows.watchingShowsLS + SHOWS_TO_LOAD_INITIAL
      //       : loadedShows.watchingShowsLS,
      //   },
      // }
    }

    case ActionTypesEnum.DisableLoad: {
      draft.disableLoad[activeSection] = !!(
        loadedShows[activeSection] >=
        action.payload.userShows.filter((show: any) =>
          activeSection === 'finishedShows' ? !!show.finished : !!(show.database === activeSection && !show.finished),
        ).length
      )
      break
      // return {
      //   ...state,
      //   disableLoad: {
      //     ...disableLoad,
      //     [activeSection]: !!(
      //       loadedShows[activeSection] >=
      //       action.payload.userShows.filter((show: any) =>
      //         activeSection === 'finishedShows'
      //           ? !!show.finished
      //           : !!(show.database === activeSection && !show.finished),
      //       ).length
      //     ),
      //   },
      // }
    }

    case ActionTypesEnum.DisableLoadLS: {
      draft.disableLoad.watchingShowsLS = !!(
        loadedShows.watchingShowsLS >= context.userContentLocalStorage.watchingShows.length
      )
      break
      // return {
      //   ...state,
      //   disableLoad: {
      //     ...disableLoad,
      //     watchingShowsLS: !!(loadedShows.watchingShowsLS >= context.userContentLocalStorage.watchingShows.length),
      //   },
      // }
    }

    case ActionTypesEnum.ChangeActiveSection: {
      draft.activeSection = action.payload.activeSection
      break
      // return {
      //   ...state,
      //   activeSection: action.payload.activeSection,
      // }
    }

    case ActionTypesEnum.UpdateContext: {
      draft.context = action.payload.context
      break
      // return {
      //   ...state,
      //   context: action.payload.context,
      // }
    }

    default:
      break
  }
})

// const reducer: React.Reducer<ShowsContentState, ACTIONTYPES> = (state, action) => {
//   const { loadedShows, disableLoad, activeSection, context } = state

//   switch (action.type) {
//     case ActionTypesEnum.IncrementLoadedShows: {
//       return {
//         ...state,
//         loadedShows: {
//           ...loadedShows,
//           [activeSection]: !disableLoad[activeSection]
//             ? loadedShows[activeSection] + SHOWS_TO_LOAD_INITIAL
//             : loadedShows[activeSection],
//         },
//       }
//     }

//     case ActionTypesEnum.IncrementLoadedShowsLS: {
//       return {
//         ...state,
//         loadedShows: {
//           ...loadedShows,
//           watchingShowsLS: !disableLoad.watchingShowsLS
//             ? loadedShows.watchingShowsLS + SHOWS_TO_LOAD_INITIAL
//             : loadedShows.watchingShowsLS,
//         },
//       }
//     }

//     case ActionTypesEnum.DisableLoad: {
//       return {
//         ...state,
//         disableLoad: {
//           ...disableLoad,
//           [activeSection]: !!(
//             loadedShows[activeSection] >=
//             action.payload.userShows.filter((show: any) =>
//               activeSection === 'finishedShows'
//                 ? !!show.finished
//                 : !!(show.database === activeSection && !show.finished),
//             ).length
//           ),
//         },
//       }
//     }

//     case ActionTypesEnum.DisableLoadLS: {
//       return {
//         ...state,
//         disableLoad: {
//           ...disableLoad,
//           watchingShowsLS: !!(loadedShows.watchingShowsLS >= context.userContentLocalStorage.watchingShows.length),
//         },
//       }
//     }

//     case ActionTypesEnum.ChangeActiveSection: {
//       return {
//         ...state,
//         activeSection: action.payload.activeSection,
//       }
//     }

//     case ActionTypesEnum.UpdateContext: {
//       return {
//         ...state,
//         context: action.payload.context,
//       }
//     }

//     default:
//       throw new Error()
//   }
// }

export default reducer
