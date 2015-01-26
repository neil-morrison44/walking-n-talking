Character = require "./character"

class CharacterPool
  currentCharacters: []
  scene: null
  constructor: (scene) ->
    @scene = scene

  byId: (id) ->
    (character for character in @currentCharacters when character.id is id)?[0]

  createCharacter: (data) ->
    newCharacter = new Character(@scene)
    @currentCharacters.push newCharacter

    newCharacter.id = data.char_id
    newCharacter.setPosition data.position
    console.log "character created"
    newCharacter

module.exports = CharacterPool