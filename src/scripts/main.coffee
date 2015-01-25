SpeechBubbler = require "./ui/speech_bubbler"

bubble = new SpeechBubbler()

bubble.render "Test message here and here in a new line? How come this is a thing how much text can this thing handle, can it handle a lot of text?"

console.log bubble.toDataURL()

image = new Image()
image.src = bubble.toDataURL()

document.body.appendChild image

Speech = require "speechjs"

recognizer = new Speech(
  debugging: true
  continuous: true
  interimResults: true
  autoRestart: true
)

recognizer.on "finalResult", (message) ->
  bubble.render message
  image = new Image()
  image.src = bubble.toDataURL()
  document.body.appendChild image

recognizer.start()