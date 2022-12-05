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
import { debug } from 'console'

describe('ShowEpisodes', () => {
  test('Renders correctly', () => {
    renderWithProviders(<ShowEpisodes seasonsTMDB={detailsData} showId={83867} />)
    const seasonListNode = screen.getByTestId('seasons-list')
    expect(seasonListNode).toBeInTheDocument()
  })

  test('The button text change correctly after click.', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ShowEpisodes seasonsTMDB={detailsData} showId={83867} />)
    const button = screen.getByRole('button', { name: 'Open all' })

    await waitFor(() => {
      expect(button).toHaveTextContent('Close all')
    })

    user.click(button)
    await waitFor(() => {
      expect(button).toHaveTextContent('Open all')
    })
  })
})

// export const testIt = (name: string, fn: any) => {
//   const callback = (...args: any) => {
//     const settings = renderWithProviders(<ShowEpisodes seasonsTMDB={detailsData} showId={83867} />)
//     fn(settings, ...args)
//   }

//   return test(name, callback)
// }
