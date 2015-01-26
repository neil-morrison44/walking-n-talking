SpeechBubbler = require "../ui/speech_bubbler"
TWEEN = require "tween.js"

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

  randomisePosition: ->
    @characterSpeechGroup.position.x = (Math.random()*100) - 50
    @characterSpeechGroup.position.z = (Math.random()*100) - 50

  getPosition: ->
    x: @characterSpeechGroup.position.x
    z: @characterSpeechGroup.position.z

  setPosition: (data) ->
    @characterSpeechGroup.position.x = data.x
    @characterSpeechGroup.position.z = data.z

  moveToPosition: (position) ->
    @characterSpeechGroup.position.x = position.x
    @characterSpeechGroup.position.z = position.z

    # charPos = @characterSpeechGroup.position
    # tween = new TWEEN.Tween(
    #   {
    #     x: @characterSpeechGroup.position.x
    #     z: @characterSpeechGroup.position.z
    #   } )
    #   .to( { x: x, z: z }, 2500 )
    #   .onUpdate( (current) ->
    #     charPos.x = this.x
    #     charPos.z = this.z
    #   )
    # tween.start()

  moveDelta: (x, z) ->
    @characterSpeechGroup.position.x += x
    @characterSpeechGroup.position.z += z

  sayMessage: (text) ->
    @bubbler.render text
    @speechTexture.needsUpdate = true

  clearMessage: =>
    @bubbler.clear()
    @speechTexture.needsUpdate = true
module.exports = Character