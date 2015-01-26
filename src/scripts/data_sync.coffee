class PubNubManager
  constructor: ->
    # Free pubnub account
    @pubnub = PUBNUB.init
      publish_key   : 'pub-c-825171df-922e-4a9c-811c-eb24de90556c'
      subscribe_key : 'sub-c-9d224ea2-a591-11e4-8f9e-0619f8945a4f'
      ssl: true

    @pubnub.subscribe
      channel : "walking-n-talking"
      message : @handleMessage
      connect: @sendOnConnect
      presence: console.log

    @publishDebounced = _.debounce @publish, 50

  @pubnub = null
  @connectData = null

  @handler = null

  handleMessage: (message, env, channel) =>
    @handler?(message)

  publish: (data) =>
    @pubnub.publish
      channel: "walking-n-talking"
      message: data

  uuid: ->
    @_uuid or= @pubnub.uuid()

  onConnectSend: (data) =>
    @connectData = data

  sendOnConnect: =>
    if @connectData
      @publish @connectData

module.exports = PubNubManager