import React from 'react'
import { connect } from 'react-redux'

// components
import { Helper } from './Helper.js'

// util
import {
  contextOf,
  head,
} from '../util.js'

export const HelperEditIdentum = connect(({ helperData }) => ({ helperData }))(({ helperData, itemsLive, showContexts }) =>
  <Helper id='editIdentum' title="When you edit an item, it is only changed in its current context" style={{ top: 40, left: 0 }} arrow='arrow arrow-up arrow-upleft' opaque>
    <p>Now "{helperData.newValue}" exists in "{showContexts ? head(itemsLive) : head(contextOf(itemsLive))}" and "{helperData.oldValue}" exists in "{head(helperData.oldContext)}".</p>
  </Helper>
)

// const HelperIcon = connect(({ showHelperIcon, helperData, dispa }) => ({ showHelperIcon, helperData }))(({ showHelperIcon, helperData, dispatch }) =>
//   showHelperIcon ? <div className='helper-icon'><a className='helper-icon-inner' onClick={() => dispatch({ type: 'showHelper', id: showHelperIcon })}>?</a></div> : null
// )
