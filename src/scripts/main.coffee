SpeechBubbler = require "./ui/speech_bubbler"

initCanvas = require "./ui/init_canvas"

initCanvas()

SceneManager = require "./scene_manager"

sceneManager = new SceneManager()

sceneManager.render()

Character = require "./characters/character.coffee"

char1 = new Character sceneManager.scene

char1.sayMessage "Hello"

window.char1 = char1

# bubble = new SpeechBubbler()

# bubble.render "Test message here and here in a new line? How come this is a thing how much text can this thing handle, can it handle a lot of text?"

# console.log bubble.toDataURL()

# image = new Image()
# image.src = bubble.toDataURL()

# document.body.appendChild image

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

recognizer.start()