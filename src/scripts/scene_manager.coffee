class SceneManager
  canvas: null
  scene: null
  renderer: null
  camera: null

  stopped: false

  constructor: ->
    @captureCanvas()
    @createScene()
    @createRenderer()
    @createGroundAndSky()

    

  captureCanvas: ->
    @canvas = document.getElementById "worldCanvas"

  render: =>
    if not @stopped
      window.requestAnimationFrame @render
    @renderer.render @scene, @camera

  createScene: ->
    @scene = new THREE.Scene()

    SCREEN_WIDTH = window.innerWidth
    SCREEN_HEIGHT = window.innerHeight

    VIEW_ANGLE = 30
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT
    NEAR = 0.1
    FAR = 20000

    @camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR)
    @scene.add @camera
    @camera.position.set 0, 150, 400
    @camera.lookAt @scene.position

  createGroundAndSky: ->
    floorMaterial = new THREE.MeshBasicMaterial( { color: "green", side: THREE.DoubleSide } )
    floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10)
    floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.position.y = -0.5
    floor.rotation.x = Math.PI / 2
    @scene.add(floor)

    skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 )
    skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } )
    skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial )

    @scene.add skyBox

    @scene.fog = new THREE.FogExp2( 0x9999ff, 0.0015 )

  createRenderer: ->
    @renderer = new THREE.WebGLRenderer(
      antialias:true
      canvas: @canvas
    )




module.exports = SceneManager