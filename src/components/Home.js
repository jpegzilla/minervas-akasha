/* eslint no-useless-escape: off */
import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  memo,
  useMemo
} from 'react'

import { uuidv4, isEmpty } from './../utils/misc'
import PropTypes from 'prop-types'
import Taskbar from './Taskbar'
import Topbar from './Topbar'
import { makeStruct } from '../utils/managers/StructureMap'
import { Minerva } from '../utils/managers/Minerva'
import dataStructureFileParser from './windows/elements/utils/dataStructureFileParser'
import useToast from './../hooks/useToast'

import exportWorker from './../utils/managers/workers/exportWorker.worker'

import WindowTypes from './windows/WindowTypes'

import { globalContext } from './App'
import { hasDatePassed } from './../utils/dateUtils'

const Home = props => {
  const { routeProps } = props

  const { minerva, loggedIn, setLoggedIn } = useContext(globalContext)

  const toast = useToast()

  const [activeWindow, setActiveWindow] = useState(null)
  const [activeWindowId, setActiveWindowId] = useState('default')
  const [activeFileData, setActiveFileData] = useState()
  minerva.setActiveWindowId = setActiveWindowId

  // windows have two states: minimized and restored
  const [windows, setWindows] = useState(minerva.windows)
  minerva.setApplicationWindows = setWindows

  // handle drag / drop events
  const [droppable, setDroppable] = useState(false)

  const showDropZone = () => setDroppable(true)
  const hideDropZone = () => setDroppable(false)

  const [droppedFiles, setDroppedFiles] = useState()

  useEffect(() => {
    let loginExpired = minerva.get(`user:${minerva.user.id}:token`)
      ? hasDatePassed(minerva.get(`user:${minerva.user.id}:token`).expires)
      : false

    setLoggedIn(loginExpired ? false : true)
  }, [minerva, loggedIn, setLoggedIn])

  useEffect(() => {
    if (routeProps.location.state === 'signup') {
      toast.add({
        duration: 3000,
        text: 'status: signup successful.',
        type: 'success'
      })
    }

    if (routeProps.location.state === 'login') {
      toast.add({
        duration: 3000,
        text: 'login complete.',
        type: 'success'
      })
    }
  }, [routeProps.location.state, toast])

  // handlers for dealing with file drag + drop on desktop
  const allowDrag = e => {
    e.dataTransfer.dropEffect = 'copy'
    e.preventDefault()
  }

  useEffect(() => {
    if (droppedFiles) {
      // detect if file is a minerva's akasha save file
      console.log(droppedFiles)
      const { name, type } = droppedFiles
      if (name.startsWith('minerva_sd_') || type === 'application/json') {
        const worker = new exportWorker()

        worker.postMessage({ data: droppedFiles, action: 'parse' })

        worker.addEventListener('message', e => {
          console.log(e)
          if (e.data) {
            if (e.data.minerva_file_header === Minerva.fileHeader) {
              setDroppedFiles()

              minerva.makeConfirmBox(
                {
                  confirm: () => {
                    minerva.importDataFromJsonFile(e.data)
                  },
                  name,
                  message: 'overwritewarning'
                },
                e.data
              )

              return
            } else {
              setDroppedFiles()

              dataStructureFileParser(
                droppedFiles,
                toast,
                null,
                setActiveFileData
              )
            }
          }
        })
      } else {
        setDroppedFiles()

        dataStructureFileParser(droppedFiles, toast, null, setActiveFileData)
      }
    }
  }, [droppedFiles, minerva, toast])

  // effect that should fire whenever a file is dropped on the desktop
  useEffect(() => {
    if (activeFileData) {
      console.log(activeFileData)

      const struct = makeStruct('shard', uuidv4(), minerva, uuidv4, null)

      minerva.activeFileData = activeFileData

      minerva.setWindows([...minerva.windows, struct])

      setWindows([...minerva.windows])
    }
  }, [activeFileData, minerva])
  // #########################################################
  // DEBUG: this hook is ONLY to watch for minerva's record becoming
  // empty during normal operation. if that happens, this hook will throw.
  // this should no longer exist in later versions, because minerva's record
  // will be more robust.
  useEffect(() => {
    if (!minerva.record) {
      console.log(minerva)
      console.log('there is something very wrong. minerva has no record.')
      // throw new Error(
      //   "there is something very wrong. minerva has no record."
      // );
      return
    } else if (
      Object.keys(minerva.record).length < 1 &&
      minerva.get('logged_in')
    ) {
      minerva.set('logged_in', false)
      console.warn('minerva has lost her memory!!', minerva)
    }

    // if minerva is okay, then say so -
    console.log('minerva is at peace.', minerva)
  }, [minerva, minerva.record])
  // #########################################################

  // this is to keep the windows in state synchronized with minerva
  useEffect(() => minerva.setWindows(windows), [windows, minerva])

  const taskBarMenuRef = useRef(null)
  const settingsMenuRef = useRef(null)

  // function that determines the amount to move windows based on mouse position and offset.
  // currently, the mouse offset is a little broken.

  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [addMenuOpen, setAddMenuOpen] = useState(false)

  // object to track how many components there are of a certain type.
  // this is to help react correctly identify components by providing
  // a robust and accurate / change-resistant key to each component
  // in the list.
  const componentCounts = {}

  return useMemo(() => {
    const handleDrop = e => {
      e.stopPropagation()
      e.preventDefault()
      setDroppedFiles(e.dataTransfer.files[0])
      hideDropZone()
    }

    const handleDragLeave = () => {
      hideDropZone()
    }

    const handleDragOver = e => {
      e.stopPropagation()
      e.preventDefault()
      showDropZone()
    }

    return (
      <section
        id='window-system'
        onClick={e => {
          if (e.target !== taskBarMenuRef && e.target !== settingsMenuRef) {
            // e.stopPropagation();
            // e.preventDefault();
            setMenuOpen(false)
            setAddMenuOpen(false)
            setSettingsOpen(false)
          }
        }}>
        <Topbar
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          settingsMenuRef={settingsMenuRef}
        />
        <section
          onMouseDown={e => void e.stopPropagation()}
          className={droppable ? 'filedrop active' : 'filedrop'}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDragEnter={allowDrag}
          id='main-container'>
          {windows.map(item => {
            if (item.belongsTo === minerva.user.id) {
              // if item is offscreen, reset.
              // this should maybe change to use the iselementinviewport utility.
              if (
                item.position.x < 0 ||
                item.position.y < 0 ||
                item.position.x > window.innerWidth - 50 ||
                item.position.y > window.innerHeight - 50
              )
                item.position = {
                  x: 100,
                  y: 100
                }
              // this needs to exist so that the correct component is rendered.
              // this object must contain every type of component that the home
              // screen needs to render, becuase it uses a dynamic component
              // jsx name or whatever it's called. lol
              const typeMap = WindowTypes
              const Component = typeMap[item.stringType]
              // flag for active class
              let isActive = ''
              if (item.id === activeWindowId) isActive = 'active'
              // used to determine how to count elements being rendered.
              // counts based on type of component.
              componentCounts[
                !isEmpty(item.componentProps)
                  ? item.componentProps.type
                  : item.title || item.component
              ] =
                componentCounts[
                  !isEmpty(item.componentProps)
                    ? item.componentProps.type
                    : item.title || item.component
                ] + 1 || 1

              const key = `${item.title}-window-${item.id}`
              return (
                <Component
                  item={item}
                  num={
                    componentCounts[
                      !isEmpty(item.componentProps)
                        ? item.componentProps.type
                        : item.title || item.component
                    ]
                  }
                  records={minerva.record.records}
                  component={item.component}
                  componentProps={item.componentProps}
                  setWindows={setWindows}
                  windows={windows}
                  className={isActive}
                  key={key}
                  setActiveWindowId={setActiveWindowId}
                  activeWindowId={activeWindowId}
                  setActiveWindow={setActiveWindow}
                />
              )
            }
            return false
          })}
        </section>
        <Taskbar
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          taskBarMenuRef={taskBarMenuRef}
          activeWindow={activeWindow}
          setActiveWindow={setActiveWindow}
          activeWindowId={activeWindowId}
          setActiveWindowId={setActiveWindowId}
          windows={windows}
          setWindows={setWindows}
          addMenuOpen={addMenuOpen}
          setAddMenuOpen={setAddMenuOpen}
        />
      </section>
    )
  }, [
    menuOpen,
    settingsOpen,
    addMenuOpen,
    droppable,
    windows,
    activeWindowId,
    componentCounts,
    activeWindow,
    minerva
  ])
}

export default memo(Home)

Home.propTypes = {
  routeProps: PropTypes.object
}
