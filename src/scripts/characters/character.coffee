SpeechBubbler = require "../ui/speech_bubbler"

class Character
  id: null
  bubbler: null
  messageTimeout: null
  characterMesh: null
  speechBubbleMesh: null
  characterMaterial: null

  constructor: (scene) ->
    @bubbler = new SpeechBubbler()

    @speechTexture = new THREE.Texture(@bubbler.canvas)
    @speechTexture.needsUpdate = true

    @characterMaterial = new THREE.MeshBasicMaterial(
      color: "red"
      side:THREE.DoubleSide
    )
    characterGeometry = new THREE.PlaneGeometry(25, 35, 1, 1)
    @characterMesh = new THREE.Mesh(characterGeometry, @characterMaterial)
    @characterMesh.position.set -100, 25, 0

    scene.add @characterMesh

    @speechMaterial = new THREE.MeshBasicMaterial(
      map: @speechTexture
      side:THREE.DoubleSide
    )

    @speechMaterial.transparent = true

    speechGeometry = new THREE.PlaneGeometry(50, 80, 1, 1)
    @speechMesh = new THREE.Mesh(speechGeometry, @speechMaterial)
    @speechMesh.position.set -70, 25+35+23, 0

    scene.add @speechMesh

    

  moveToPosition: (x, y) ->
  sayMessage: (text) ->
    @bubbler.render text
    @speechTexture.needsUpdate = true
  clearMessage: =>

module.exports = Character