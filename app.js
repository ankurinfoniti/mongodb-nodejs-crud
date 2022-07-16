const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const circulationRepo = require('./repos/circulationRepo');
const data = require('./circulation.json');

const url = 'mongodb://localhost:27017';
const dbName = 'circulation';

async function main() {
  const client = new MongoClient(url);
  await client.connect();

  try {
    // load data to collection
    const results = await circulationRepo.loadData(data);
    assert.equal(data.length, results.insertedCount);

    // get data from collection
    const getData = await circulationRepo.get();
    assert.equal(data.length, getData.length);

    // filter data from collection
    const filterData = await circulationRepo.get({
      Newspaper: getData[4].Newspaper,
    });
    assert.deepEqual(filterData[0], getData[4]);

    // get limited data from collection
    const limitData = await circulationRepo.get({}, 3);
    assert.equal(limitData.length, 3);

    // get data by id
    const id = getData[4]._id.toString();
    const byId = await circulationRepo.getById(id);
    assert.deepEqual(byId, getData[4]);

    // add data to collection
    const newItem = {
      Newspaper: 'CRPaper',
      'Daily Circulation, 2004': 1000,
      'Daily Circulation, 2013': 800,
      'Change in Daily Circulation, 2004-2013': 10,
      'Pulitzer Prize Winners and Finalists, 1990-2003': 2,
      'Pulitzer Prize Winners and Finalists, 2004-2014': 1,
      'Pulitzer Prize Winners and Finalists, 1990-2014': 3,
    };
    const addedItem = await circulationRepo.add(newItem);
    assert(addedItem.insertedId);
    const addedItemQuery = await circulationRepo.getById(addedItem.insertedId);
    assert.deepEqual(addedItemQuery, newItem);

    // update data to collection
    const updateItem = {
      Newspaper: 'New CRPaper',
      'Daily Circulation, 2004': 1000,
      'Daily Circulation, 2013': 800,
      'Change in Daily Circulation, 2004-2013': 10,
      'Pulitzer Prize Winners and Finalists, 1990-2003': 2,
      'Pulitzer Prize Winners and Finalists, 2004-2014': 1,
      'Pulitzer Prize Winners and Finalists, 1990-2014': 3,
    };
    const updatedItem = await circulationRepo.update(
      addedItem.insertedId,
      updateItem
    );
    const updatedItemQuery = await circulationRepo.getById(
      addedItem.insertedId
    );
    assert.equal(updatedItemQuery.Newspaper, 'New CRPaper');

    // remove data from collection
    const removed = await circulationRepo.remove(addedItem.insertedId);
    assert(removed);
    const deletedItem = await circulationRepo.getById(addedItem.insertedId);
    assert.equal(deletedItem, null);

    // get average finalist to collection
    const avgFinalists = await circulationRepo.averageFinalists();
    console.log('avgFinalists', avgFinalists);

    const avgByChange = await circulationRepo.averageFinalistsByChange();
    console.log('avgByChange', avgByChange);
  } catch (error) {
    console.log(error);
  } finally {
    const admin = client.db(dbName).admin();

    await client.db(dbName).dropDatabase();
    //console.log(await admin.listDatabases());

    client.close();
  }
}

main();
