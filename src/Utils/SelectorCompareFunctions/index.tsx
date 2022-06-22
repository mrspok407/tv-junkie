import * as _isEqual from 'lodash.isequal'
import * as _omit from 'lodash.omit'

interface SelectorCompareTimestamps {
  timeStamp: number
}

// When you set timeStamp in Firebase by server value like that: firebase.timeStamp(), it will first set from client
// timeStamp and then will update by server value. This will result in unnecessary run of child_change listener.
// Here I'm checking if only timeStamp was changed to avoid rerender by useSelector()
const selectorCompareTimestamps = (
  left: Partial<SelectorCompareTimestamps>,
  right: Partial<SelectorCompareTimestamps>,
) => {
  if (Number.isNaN(left?.timeStamp) || Number.isNaN(right?.timeStamp)) {
    return left === right
  }
  if (!_isEqual(_omit(left, ['timeStamp']), _omit(right, ['timeStamp']))) {
    return false
  } else {
    return true
  }
}

export const isTimestampsEqual = <T,>(left: T, right: T) => selectorCompareTimestamps(left, right)
