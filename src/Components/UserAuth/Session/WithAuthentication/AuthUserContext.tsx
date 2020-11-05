import { createContext } from "react"

const AuthUserContext = createContext<{ uid: string }>({ uid: "" })

export default AuthUserContext
