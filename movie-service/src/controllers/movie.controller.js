import queryBody from "./queryBody";
import ESClient from "../config/ESClient.config";

const normalizeData = ESResponse =>
  ESResponse.hits.hits.map((hit, index) => {
    const newHit = {};
    newHit.id = hit._id;
    newHit.score = hit._score;
    newHit.data = { ...hit._source };
    delete newHit.data.req_headers;
    delete newHit.data.res_headers;
    return newHit;
  });

export default {
  getMovie: async (reqData, callback) => {
    const { movieId } = reqData;
    const response = await ESClient.search({
      index: "imdb",
      body: queryBody.testSearchAll(25)
    });
    callback(null, {
      meta: {
        type: "success",
        status: 200,
        message: ""
      },
      data: {
        movieId,
        response
      }
    });
  },
  getMovieCollections: async (reqData, callback) => {
    const { collectionName } = reqData;
    let response;
    switch (collectionName) {
      case "popular":
        response = await ESClient.search({
          index: "imdb",
          sort: "imdb_ratingCount:desc",
          body: queryBody.testSearchAll(25)
        });
        callback(null, {
          meta: {
            type: "success",
            status: 200,
            message: ""
          },
          data: {
            total: response.hits.total,
            collectionName,
            timeSpent: response.took,
            collectionLength: response.hits.hits.length,
            movieCollection: normalizeData(response)
          }
        });
        break;
      case "rating":
        response = await ESClient.search({
          index: "imdb",
          sort: "imdb_ratingValue:desc",
          body: queryBody.testSearchAll(25)
        });

        callback(null, {
          meta: {
            type: "success",
            status: 200,
            message: ""
          },
          data: {
            total: response.hits.total,
            collectionName,
            timeSpent: response.took,
            collectionLength: response.hits.hits.length,
            movieCollection: normalizeData(response)
          }
        });
        break;
      case "trending":
        // not scrape movie's release date yet,it will return by index's default order
        response = await ESClient.search({
          index: "imdb",
          body: queryBody.testSearchAll(25)
        });
        callback(null, {
          meta: {
            type: "success",
            status: 200,
            message: ""
          },
          data: {
            total: response.hits.total,
            collectionName,
            timeSpent: response.took,
            collectionLength: response.hits.hits.length,
            movieCollection: normalizeData(response)
          }
        });
        break;
      default:
        callback(null, {
          meta: {
            type: "error",
            status: 403,
            message: `collection type "${collectionName}" is not valid`
          }
        });
    }
  }
};
