import React, { createContext, useState } from 'react'
import { Helmet } from 'react-helmet'
import ScrollToTop from 'Utils/ScrollToTopBar'
import Header from 'Components/UI/Header/Header'
import Footer from 'Components/UI/Footer/Footer'
import useGoogleRedirect from 'Components/UserAuth/SignIn/UseGoogleRedirect'
import ShowsContent from './ShowsContent'

export const TestContext = createContext(0)

const TestComp = ({ children }) => {
  const [counter, setCounter] = useState(0)
  return (
    <>
      <TestContext.Provider value={counter}>
        <button onClick={() => setCounter(counter + 1)}>Count+</button>
        {/* <ShowsContent /> */}
        {children}
      </TestContext.Provider>
    </>
  )
}

const Shows: React.FC = () => {
  useGoogleRedirect()
  return (
    <>
      <Helmet>
        <title>All your shows | TV Junkie</title>
      </Helmet>
      <Header />
      <TestComp>
        <ShowsContent />
      </TestComp>
      <Footer />
      <ScrollToTop />
    </>
  )
}

export default Shows
