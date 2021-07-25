interface AuthUserInterface {
  uid: string
  email?: string
  emailVerified?: boolean
  username?: string
}

interface AuthUserFirebaseInterface {
  user: { email: string; uid: string; displayName: string }
}

interface AuthUserGoogleSignInInterface {
  user: { email: string; uid: string; displayName: string }
  additionalUserInfo: { isNewUser: boolean }
}

export type { AuthUserInterface, AuthUserFirebaseInterface, AuthUserGoogleSignInInterface }
