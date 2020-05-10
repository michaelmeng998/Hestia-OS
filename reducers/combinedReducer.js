import { combineReducers } from 'redux'
import order from './order'
import scheduler from './locations'
import settings from './settings'

export default combineReducers({
  order,
  scheduler,
  settings
})