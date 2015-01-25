CANVAS_WIDTH = 300
CANVAS_HEIGHT = 500
LINE_HEIGHT = 25

wordWrapper = require "word-wrapper"

class SpeechBubbler
  canvas: null
  context: null
  text: null

  oneLiner: true
  width: null
  height: null

  constructor: ->
    @generateCanvas()
    @setCanvasStyle()

  render: (text) ->
    @text = text
    @clear()

    @measureText()
    @renderSpeechBubble()
    @renderText()

  clear: ->
    @context.clearRect 0,0, CANVAS_WIDTH, CANVAS_HEIGHT

  getLines: ->
    wordWrapper.lines(@text, {width: 17})

  renderText: ->
    @context.fillStyle = "black"
    lines = @getLines()

    top = (CANVAS_HEIGHT - 22) - @height

    offsetY = 0

    for line in lines
      text = @text.substring(line.start, line.end)
      @context.fillText text, 22, top + 25 + offsetY
      offsetY += LINE_HEIGHT

  measureText: ->
    textMeasure = @context.measureText @text

    if textMeasure.width < (CANVAS_WIDTH - 60)
      @oneLiner = true
      @width = textMeasure.width + 60
      @height = LINE_HEIGHT + 8
    else
      @oneLiner = false
      @width = CANVAS_WIDTH
      @height = (@getLines().length * LINE_HEIGHT) + 8

  renderSpeechBubble: ->

    top = (CANVAS_HEIGHT - 22) - @height

    @context.beginPath()

    @context.moveTo 2, CANVAS_HEIGHT - 2
    @context.lineTo 18, CANVAS_HEIGHT - 22
    @context.lineTo 8, CANVAS_HEIGHT - 22
    @context.lineTo 8, top
    @context.lineTo @width - 22, top
    @context.lineTo @width - 22, CANVAS_HEIGHT - 22
    @context.lineTo 38, CANVAS_HEIGHT - 22

    @context.closePath()

    @context.fillStyle = "white"
    @context.fill()
    @context.stroke()

  setCanvasStyle: ->
    @context.lineWidth = 2
    @context.styleStyle = "black"
    @context.font = "18pt monospace"

  generateCanvas: ->
    @canvas = document.createElement "canvas"
    @canvas.width = CANVAS_WIDTH
    @canvas.height = CANVAS_HEIGHT

    @context = @canvas.getContext "2d"

  toDataURL: ->
    @canvas.toDataURL()

module.exports = SpeechBubbler