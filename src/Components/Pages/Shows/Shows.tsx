import React, { createContext, useCallback, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import ScrollToTop from 'Utils/ScrollToTopBar'
import Header from 'Components/UI/Header/Header'
import Footer from 'Components/UI/Footer/Footer'
import useGoogleRedirect from 'Components/UserAuth/SignIn/UseGoogleRedirect'
import ShowsContent from './ShowsContent'

export const TestContext = createContext({})

// const TestComp = ({ children }) => {
//   const [counter, setCounter] = useState(0)

//   const handleClick = useCallback(() => {
//     setCounter((prevState) => prevState + 1)
//   }, [])
//   // const handleClick = () => {
//   //   setCounter((prevState) => prevState + 1)
//   // }
//   const contextValue = useMemo(() => {
//     return {
//       handleClick,
//       counter,
//     }
//   }, [counter, handleClick])
//   return (
//     <>
//       <TestContext.Provider value={contextValue}>
//         <button onClick={() => setCounter(counter + 1)}>Count+</button>
//         {/* <ShowsContent /> */}
//         {children}
//       </TestContext.Provider>
//     </>
//   )
// }

const Shows: React.FC = () => {
  useGoogleRedirect()
  return (
    <>
      <Helmet>
        <title>All your shows | TV Junkie</title>
      </Helmet>
      <Header />
      <ShowsContent />
      <Footer />
      <ScrollToTop />
    </>
  )
}

export default Shows
