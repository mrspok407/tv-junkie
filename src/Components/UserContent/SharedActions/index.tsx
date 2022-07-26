import { createAction } from '@reduxjs/toolkit'

export const setInitialContentLoading = createAction<boolean>('initialContentLoading')
export const resetErrors = createAction<null>('resetErrors')
export const resetSlicesState = createAction('resetSlicesState')
