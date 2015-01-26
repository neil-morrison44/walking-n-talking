SpeechBubbler = require "./ui/speech_bubbler"
initCanvas = require "./ui/init_canvas"
vkey = require "vkey"
CharacterPool = require "./characters/pool"
SceneManager = require "./scene_manager"
Character = require "./characters/character"

initCanvas()


sceneManager = new SceneManager()

window.requestAnimationFrame(sceneManager.render)

char1 = new Character sceneManager.scene
window.char1 = char1
char1.randomisePosition()
startingPosition = char1.getPosition()
sceneManager.focusCameraOn startingPosition.x, startingPosition.z

if window.webkitSpeechRecognition
  Speech = require "speechjs"

  recognizer = new Speech(
    debugging: true
    continuous: true
    interimResults: true
    autoRestart: true
    pfilter: false
  )
  currentImage = null
  recognizer.on "interimResult", ->
    # if currentImage is null
    #   bubble.render "..."
    #   currentImage = new Image()
    #   currentImage.src = bubble.toDataURL()
    #   document.body.appendChild currentImage
    #   console.log "started"

  recognizer.on "finalResult", (message) ->
    char1.sayMessage message

    dataSync.publish
      char_id: dataSync.uuid()
      action: "talk"
      text: message

  recognizer.start()

pressedKeys = {}

document.body.addEventListener 'keydown', (ev) ->
  pressedKeys[vkey[ev.keyCode]] = true

document.body.addEventListener 'keyup', (ev) ->
  delete pressedKeys[vkey[ev.keyCode]]

window.setInterval ->

  if pressedKeys['W']
    z = -1
  else if pressedKeys['S']
    z = 1
  else
    z = 0
  if pressedKeys['A']
    x = -1
  else if pressedKeys['D']
    x = 1
  else
    x = 0

  unless x is 0 and z is 0
    char1.moveDelta(x, z)
    charPos = char1.getPosition()
    sceneManager.focusCameraOn charPos.x, charPos.z

    dataSync.publishDebounced
      char_id: dataSync.uuid()
      action: "walk"
      position: charPos

, 16

DataSync = require "./data_sync"

window.dataSync = dataSync = new DataSync()

characterPool = new CharacterPool(sceneManager.scene)

dataSync.handler = (message) ->
  if message.char_id is dataSync.uuid()
    return

  character = characterPool.byId message.char_id
  character or= characterPool.createCharacter message

  if message.action is "create"
    characterPool.createCharacter message
  if message.action is "walk"
    character.moveToPosition message.position
  if message.action is "talk"
    character.sayMessage message.text

dataSync.onConnectSend
  char_id: dataSync.uuid()
  action: "create"
  position: char1.getPosition()
