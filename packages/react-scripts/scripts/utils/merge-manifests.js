let path = require('path');
let _ = require('lodash');
let paths = require('../../config/paths');

let manifestDir = path.join(paths.appPublic, 'manifest');
let baseManifest = require(path.resolve(manifestDir, 'base.json'));
let devManifest = require(path.resolve(manifestDir, 'dev.json'));

let ENV = process.env.NODE_ENV || 'development';

let createMergeMap = arr => arr.map(m => Object.entries(m)).filter(([k]) => k);

let mergeCollection = (
  collection,
  {
    filter = () => {},
    reducer = [
      (o, m) => {
        let x = m.reduce((obj, [k, v]) => {
          obj[k] = v;

          return obj;
        }, {});

        return { ...o, ...x };
      },
      {},
    ],
  }
) => collection.map(m => m.filter(filter)).reduce(...reducer);

let main = (target = 'chrome') => {
  let buildManifest = require(path.resolve(manifestDir, `${target}.json`));

  let collectionsToMerge = createMergeMap(
    ENV === 'development'
      ? [baseManifest, buildManifest, devManifest]
      : [baseManifest, buildManifest]
  );

  let merged = mergeCollection(collectionsToMerge, {
    filter: ([, v]) => !_.isArrayLikeObject(v),
  });

  let mergedObjs = mergeCollection(collectionsToMerge, {
    filter: ([, v]) => _.isObject(v) && !Array.isArray(v),
  });

  let reduceArrays = (o, m) => {
    let x = m.map(([k, v]) => ({ [k]: [...k, ...(o[k] || [])] }))[0];

    console.log(o, x);
    return x;
  };
  let mergedArrays = mergeCollection(collectionsToMerge, {
    filter: ([, v]) => Array.isArray(v),
    reducer: [reduceArrays, {}],
  });

  console.log(mergedArrays);
};

main();
