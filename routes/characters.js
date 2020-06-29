const express = require('express');
const router = express.Router();
const marvelClient = rootRequire('./api_client/marvel_client');
const asyncHandler = require('express-async-handler');

/**
 * @swagger
 * /characters:
 *  get:
 *    description: Use to get all characters's IDs.
 *    responses:
 *      '200':
 *        description: Successfully get all characters's IDs.
 *      '500':
 *        description: Failed to get characters IDs. Possible cause? Wrongly configure API key.
 */
router.get('/', asyncHandler(async (req, res, next) =>
{
  let error = {status:500, message:'Failed to get characters IDs. Please make sure you configure Marvel API key correctly.'};
  let charactersIds;

  try
  {
    charactersIds = await marvelClient.getCharactersIds();
  }
  catch(err)
  {
    error.cause = err;
  }

  if(charactersIds && charactersIds.length!=0)
  {
    res.send(JSON.stringify(charactersIds));
    next();
  }
  else
  {
    throw error;
  }
}));

/**
 * @swagger
 * /characters/{characterId}:
 *    get:
 *      description: Get character's info (id, name, description) by id.
 *      parameters:
 *        - name: characterId
 *          in: path
 *          description: ID of the character.
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: Successfully get character info.
 *        '404':
 *          description: Character not found.
 */
router.get('/:characterId(\\d+)/', asyncHandler(async (req, res, next) =>
{
  const characterId = parseInt(req.params.characterId);
  let error = {status:404, message:`Failed to get character details info with ID = ${characterId}.`};
  let character;

  try
  {
    character = await marvelClient.getCharacterById(characterId);
  }
  catch(err)
  {
    error.cause = err;
  }

  if(character)
  {
    res.send(character);
    next();
  }
  else
  {
    throw error;
  }
}));

/**
 * @swagger
 * /characters/force-refetched:
 *  get:
 *    description: Use to force refetch the data (clear the cache).
 *    responses:
 *      '200':
 *        description: Successfully force refetch the data.
 *      '500':
 *        description: Failed to force refetch the data.
 */
router.get('/force-refetched', asyncHandler(async (req, res, next) =>
{
  try
  {
    await marvelClient.fetchData();
    res.send({fetched: "SUCCESS"});
    next();
  }
  catch(err)
  {
    throw {status:500, message:'Failed to force refetched data.', stack: err.toString()};
  }
}));

module.exports = router;
