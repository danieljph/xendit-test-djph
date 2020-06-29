const axiosRaw = require('axios');
const md5 = rootRequire('./utils/md5');
const HashMap = require('hashmap');

let lastFetchedMillis = new Date().getTime();
const cacheExpirationInMillis = 10 * 60 * 1000; // Cache will expire after 10 minutes.

const axiosRequestConfig = {
  baseURL: 'https://gateway.marvel.com/v1/public'
};

const axios = axiosRaw.create(axiosRequestConfig);



const generalInterceptor = (request) =>
{
  const publicKey = process.env.MARVEL_PUBLIC_KEY;
  const privateKey = process.env.MARVEL_PRIVATE_KEY;
  const ts = new Date().getTime().toString();
  const rawHash = ts + privateKey + publicKey;
  const hash = md5(rawHash);

  request.params = request.params || {};
  request.params['ts'] = ts;
  request.params['apikey'] = publicKey;
  request.params['hash'] = hash;

  return request
};

axios.interceptors.request.use(generalInterceptor);

const cacheStorage = new HashMap();

var isPublicAndPrivateKeyExist = () =>
{
  const publicKey = process.env.MARVEL_PUBLIC_KEY;
  const privateKey = process.env.MARVEL_PRIVATE_KEY;
  return !publicKey || !privateKey;
}

var fetchData = async () =>
{
  try
  {
    cacheStorage.clear();

    if(isPublicAndPrivateKeyExist())
    {
      throw {message: "Please make sure you configure the public key & private key correctly. And make sure you put .env file that contains the public & private key information on the root of this project."};
    }

    let counter = 0;
    const limit = 100;
    let axiosResponse = await axios.get("/characters", {params: {offset: counter, limit}});
    const total = axiosResponse.data.data.total;
      
    axiosResponse.data.data.results.forEach(it => {
      cacheStorage.set(it.id, {id: it.id,name: it.name,description: it.description});
      counter++;
    });
  
    console.log(`Counter: ${counter}, Total: ${total}`);
    while(counter<total)
    {
      axiosResponse = await axios.get("/characters", {params: {offset: counter, limit}});
      const responseBody = axiosResponse.data;
      responseBody.data.results.forEach(it => {
        cacheStorage.set(it.id, {id: it.id, name: it.name, description: it.description});
        counter++;
      });
      console.log(`Counter: ${counter}, Total: ${total}`);
    }

    lastFetchedMillis = new Date().getTime();
  }
  catch(err)
  {
    cacheStorage.clear();
    throw err;
  }
}

const checkIfShouldFetchData = async() =>
{
  if(cacheStorage.count()<=0)
  {
    console.log("Cache is still empty. Fetching data...");
    await fetchData();
  }
  else if(new Date().getTime()-lastFetchedMillis>=cacheExpirationInMillis)
  {
    console.log(`${new Date().getTime()} - ${lastFetchedMillis} >= ${cacheExpirationInMillis}`);
    console.log("Cache is expired. Fetching new data...");
    await fetchData();
  }
}

const getCharactersIds = async() =>
{
  await checkIfShouldFetchData();
  const charactersIds = [];
  cacheStorage.forEach((value, key) => {charactersIds.push(key)});
  return charactersIds;
}

const getCharacterById = async(id) =>
{
  await checkIfShouldFetchData();
  return cacheStorage.get(id);
}

module.exports = {fetchData, getCharactersIds, getCharacterById};
