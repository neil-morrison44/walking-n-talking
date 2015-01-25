SpeechBubbler = require "../ui/speech_bubbler"

class Character
  id: null
  bubbler: null
  messageTimeout: null
  characterMesh: null
  speechBubbleMesh: null
  characterMaterial: null
  characterSpeechGroup: null

  constructor: (scene) ->
    @bubbler = new SpeechBubbler()

    @speechTexture = new THREE.Texture(@bubbler.canvas)
    @speechTexture.needsUpdate = true


    characterTexture = new THREE.ImageUtils.loadTexture('images/character-forward.png')

    characterTexture.minFilter = characterTexture.magFilter = THREE.NearestFilter

    @characterMaterial = new THREE.MeshBasicMaterial(
      map: characterTexture
      side:THREE.DoubleSide
    )
    @characterMaterial.transparent = true

    characterGeometry = new THREE.PlaneGeometry(25, 35, 1, 1)
    @characterMesh = new THREE.Mesh(characterGeometry, @characterMaterial)
    @characterMesh.position.set -100, 17, 0

    # scene.add @characterMesh

    @speechMaterial = new THREE.MeshBasicMaterial(
      map: @speechTexture
      side:THREE.DoubleSide
    )

    @speechMaterial.transparent = true

    speechGeometry = new THREE.PlaneGeometry(50, 80, 1, 1)
    @speechMesh = new THREE.Mesh(speechGeometry, @speechMaterial)
    @speechMesh.position.set -70, 17+35+15, 1

    # scene.add @speechMesh

    @characterSpeechGroup = new THREE.Object3D()

    @characterSpeechGroup.add @characterMesh
    @characterSpeechGroup.add @speechMesh
    scene.add @characterSpeechGroup

    window.CSG = @characterSpeechGroup


  moveToPosition: (x, y) ->
  sayMessage: (text) ->
    @bubbler.render text
    @speechTexture.needsUpdate = true
  clearMessage: =>

module.exports = Character