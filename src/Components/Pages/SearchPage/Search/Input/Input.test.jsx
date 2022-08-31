import React from 'react'
import { shallow } from 'enzyme'
import Input from './Input'

jest.useFakeTimers()

describe('Input works correctly', () => {
  let uglyCheck = ''
  const wrapper = shallow(
    <Input
      onSearch={(_query) => {
        uglyCheck = _query
      }}
    />,
  )
  const $input = wrapper.find('.movie-search__input')
  const $close = '.input-clear'

  test('changes state value, without making a callback', () => {
    expect(wrapper.state('query')).toBe('')
    $input.simulate('change', { target: { value: 'check' } })
    expect(wrapper.state('query')).toBe('check')
    expect(uglyCheck).toBe('')
  })
  test('makes delayed callback', () => {
    jest.runAllTimers()
    expect(uglyCheck).toBe('check')
  })
  test('erase input on ESC press', () => {
    $input.simulate('keydown', { which: 27 })
    expect(wrapper.state('query')).toBe('')
    expect(uglyCheck).toBe('')
  })
  test('erase input on click of button-clear', () => {
    $input.simulate('change', { target: { value: 'check2' } })
    expect(wrapper.state('query')).toBe('check2')
    expect(uglyCheck).toBe('')
    wrapper.find($close).simulate('click')
    expect(wrapper.state('query')).toBe('')
    expect(uglyCheck).toBe('')
  })
})
