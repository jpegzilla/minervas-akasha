import { expect } from 'chai'
import { mount, render, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import React from 'react'
import 'regenerator-runtime'

configure({ adapter: new Adapter() })

global.React = React
global.expect = expect
global.mount = mount
global.render = render
