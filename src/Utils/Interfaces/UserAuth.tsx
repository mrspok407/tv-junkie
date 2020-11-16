interface AuthUserFirebaseInterface {
  uid: string
  user: { email: string; uid: string; displayName: string }
  additionalUserInfo: { isNewUser: boolean }
}

export type { AuthUserFirebaseInterface }
