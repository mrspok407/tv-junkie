import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestComp } from 'App'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import Slider from 'Components/UI/Slider/Slider'
import { MAINDATA_TMDB_INITIAL } from 'Utils/@TypesTMDB'
import { renderWithProviders } from 'Utils/Tests/test-utils'
import ShowEpisodes from 'Components/UI/Templates/SeasonsAndEpisodes/ShowEpisodes'
import { detailsData } from 'Utils/Tests/mocks'

describe('describe test', () => {
  it('Renders DetailsPage2', async () => {
    //   renderWithProviders(<Slider sliderData={[MAINDATA_TMDB_INITIAL]} />)
    const user = userEvent.setup()
    renderWithProviders(<ShowEpisodes seasonsTMDB={detailsData} showId={83867} />)
    const button = screen.getByRole('button')

    await waitFor(() => {
      expect(button).toHaveTextContent('Close all')
    })

    user.click(button)
    await waitFor(() => {
      expect(button).toHaveTextContent('Open all')
    })

    //   await waitFor(() => {
    //     expect(button).toHaveTextContent('Open all')
    //   })

    //   const button = screen.getByRole('button', { name: 'Open all' })
    //   expect(button).toBeInTheDocument()

    //   await user.click(button)
    //   expect(button).toHaveTextContent('Close all')

    //   await user.click(button)
    //   expect(button).toHaveTextContent('Open all')

    //   userEvent.click(openAllButton)
    //   await waitFor(() => {
    //     expect(screen.getByText('Close all')).toBeInTheDocument()
    //   })
    //   const { getByText } = render(<Slider sliderData={[MAINDATA_TMDB_INITIAL]} />)
  })
})
