# kendo-pouchdb

[![Build Status](https://travis-ci.org/terikon/kendo-pouchdb.svg?branch=master)](https://travis-ci.org/terikon/kendo-pouchdb)

[PouchDB](<http://pouchdb.com/>) is the Database that Syncs.
[Kendo UI](<http://www.telerik.com/kendo-ui>) is a set of beautiful UI widgets.
This library connects between the two, so you can bind data from database directly to Kendo and
expect them to be in sync.

**kendo-pouchdb** has following set of features:

- Sorting and filtering.
- Standard interface for Kendo UI - accessible as
[kendo.data.DataSource](<http://docs.telerik.com/kendo-ui/framework/datasource/overview>) object.
- Bi-directional sync between DataSource object and PouchDB. For example, data change on server
will automatically appear in widget.
- Support of two query plugins - [Map Reduce](<http://pouchdb.com/guides/queries.html>) and
[PouchDB Find](<https://github.com/nolanlawson/pouchdb-find>).
- Different storage scenarios are possible with PouchDB - IndexedDB, Web SQL,
[CouchDB](<http://couchdb.apache.org/>), [Cloudant](<https://cloudant.com/>)
or [Couchbase](<http://www.couchbase.com/>).
- The library is thoroughly tested with test specs.

# Table of contents

- [Demo](#demo)
- [Install](#install)
- [Use](#use)
- [API](#api)
- [Work status](#work-status)
- [Things to consider for future versions](#things-to-consider-for-future-versions)
- [Use with Couchbase Mobile](#use-with-couchbase-mobile)
- [Contribute](#contribute)

# Demo

See online demo of kendo-pouchdb:

[![Demo](<http://terikon.github.io/kendo-pouchdb/images/demo-grid.png>)](<http://terikon.github.io/kendo-pouchdb/demo/kendo-pouchdb-grid.html>)

Demo data is put into PouchDB database named *demodb*, and presented with Kendo Grid. You can create/update/delete records, and they will persist in the database. Just reload the page to see your data stored after modification.

Using [PouchDB Inspector](<https://chrome.google.com/webstore/detail/pouchdb-inspector/hbhhpaojmpfimakffndmpmpndcmonkfa>) you can change a document in database, and the Grid will
refresh itself to present your change immediately. 

In addition more features can be seen here:

- [Sorting demo](<http://terikon.github.io/kendo-pouchdb/demo/kendo-pouchdb-sort.html>)
- [Paging demo](<http://terikon.github.io/kendo-pouchdb/demo/kendo-pouchdb-paging.html>)

Demos source code reside in [demo](https://github.com/terikon/kendo-pouchdb/tree/master/demo) folder.

# Install

## with npm

```
npm install kendo-pouchdb
```

## with bower

```
bower install kendo-pouchdb
```

## include on page

Download **kendo-pouchdb.js**,
[minified](https://raw.githubusercontent.com/terikon/kendo-pouchdb/master/dist/kendo-pouchdb.min.js) or
[debug](https://raw.githubusercontent.com/terikon/kendo-pouchdb/master/kendo-pouchdb.js) version.

Include jQuery, Kendo UI, [pouchdb](<http://pouchdb.com/>)
and [pouchdb-collate.js](<https://raw.githubusercontent.com/pouchdb/collate/master/dist/pouchdb-collate.js>).
Optionally, add 
[pouchdb.find.js](<https://raw.githubusercontent.com/nolanlawson/pouchdb-find/master/dist/pouchdb.find.min.js>) for more flexible sorting and filtering.

```html
<script src="jquery.min.js"></script>
<script src="kendo.all.min.js"></script>

<script src="pouchdb.min.js"></script>
<script src="pouchdb-collate.js"></script>
<script src="pouchdb.find.min.js"></script>

<script src="kendo-pouchdb.min.js"></script>
```

## AMD support

For usage with AMD, use
[kendo-pouchdb.amd.js](<https://raw.githubusercontent.com/terikon/kendo-pouchdb/master/kendo-pouchdb.amd.js>).

Example configuration with [RequireJS](<http://requirejs.org/>):

```js
requirejs.config({
  paths: {
    "PouchDB": "lib/pouchdb/pouchdb",
    "pouchCollate": "lib/pouchdb/pouchdb-collate",
  },
  shim: {
    "kendo-pouchdb.amd": { deps: ["kendo"] }
  },
  map: {
    '*': {
        'kendo': 'kendo-pouchdb.amd'
    },
    'kendo-pouchdb.amd': { 'kendo': 'kendo' }
  }
});
define(['PouchDB'], function (PouchDB) {
  //Use PouchDB and kendo.data.PouchableDataSource.
});
```

# Use

The library adds **kendo.data.PouchableDataSource** object to Kendo, that acts like casual
kendo.data.DataSource, but can also be of "pouchdb" type.

You create pouchdb datasource like this:

```js
var dataSource = new kendo.data.PouchableDataSource({
    type: "pouchdb",
    transport: {
        pouchdb: {
            db: db,
            idField: "ProductID"
        }
    });
```

Now you can do all the things you can do with DataSource, like binding it to Grid or
any other widget, or perform dataSource.filter() or dataSource.sort().

PouchDB database will serve as remote service for the datasource, so do not forget to call 
[dataSource.sync()](<http://docs.telerik.com/kendo-ui/api/javascript/data/datasource#methods-sync>)
method when needed.

You have to provide appropriate model to use with your datasource, due to the fact that id field
for data stored in PouchDB should always be named row._id. You can either define _id field in
your schema, and set model's id to be "_id". Or you can use any name as id field, in which case you
**should not** define model's id in model configuration, as _id field will be created as copy of
if field of your choice automatically.

In either option, you must tell which field is used as id field with idField option in
transport configuration.

Example of model configuration "Kendo-way", so _id will be created for you: 

```js
schema: {
    model: {
        //Do not supply id field in schema like this, as _id field will be used as id field.
        //In other words, do not write here 'id: "ProductID"'.
        //Tell the pouchdb transport that your id field is ProductID, and it even can be a number!
        fields: {
            ProductID: { type: number },
            ProductName: { type: string }
        }
    }
}
```

Example of _id field manually defined with model configuration:

```js
schema: {
    model: {
        id: "_id",
        fields: {
            _id: { type: string }, //If you prefer to use _id directly, it should be string.
            ProductName: { type: string }
        }
    }
}
```

_id will be created by applying
[pouchCollate.toIndexableString](<https://github.com/pouchdb/collate/#toindexablestringobj>)
method to data provided by idField, so data will be sorted correctly, either it is of string or
numeric type.

## id field

id field can be of string and numeric type.
Do not use field of date type as id field.

## Model class

If, instead of model configuration, external model **class** is provided to schema, it **should** have _id field defined as model's id:

```js
var Model = kendo.data.Model.define({
    id: "_id", //This should be provided when you define your model externally
    fields: {
        name: { type: "string" }
    }
});
```

## Queries

Sorting and filtering can be used, limited to PouchDB abilities. Just use standard
dataSource.filter() and dataSource.sort() methods, or rely on your UI widget abilities.

Queries will run directly on
database. You can use two query plugins of PouchDB. Map reduce is currently default query plugin,
but it only has limited set of filter/sort combination. PouchDB Find plugin is currently in
beta state, but its support of data filtering much more liberating, thanks to
[IBM Cloadant query language](<https://docs.cloudant.com/api.html#query>).

In either case, appropriate indexes that enable data fetching should be created in advance.

## MapReduce or PouchDB Find

MapReduce will be used by default, as currently it is stable query plugin.

To use pouchdb-find, use following transport configuration:

```js
transport: {
    pouchdb: {
        db: db,
        queryPlugin: "pouchdb-find", //queryPlugin is 'mapreduce' by default
        idField: "_id"
    }
});
```

## Default View (MapReduce mode)

Default view can optionally be provided, so data will be fetched using provided view:

```js
var dataSource = new kendo.data.PouchableDataSource({
  type: "pouchdb",
  transport: {
      pouchdb: {
          db: db,
          idField: "passport",
          defaultView: "people/withName"
      }
  });
    
dataSource.fetch().then(function() {
  //The data from people/withName view will be fetched.
});
```

Pay attention that if sorting specified, sort view from fieldViews will be used instead of default view.

## Sorting (MapReduce mode)

Without configuration, only sorting by id field will work.

For sort by other fields to work, appropriate PouchDB view should be provided for each field
that will be used for sorting:

```js
var dataSource = new kendo.data.PouchableDataSource({
    type: "pouchdb",
    sort: { field: "name", dir: "asc"},
    transport: {
        pouchdb: {
            db: db,
            idField: "passport",
            fieldViews: {
              "name: "sortIndex/byName",
              "age" : "sortIndex/byAge"
            }
        }
    });
    
//Now you can sort by name
```

Error will be raised if you will try to sort by a field that has no index.

When sorting by the _id field, do not provide view for it in fieldViews. Use defaultView instead.

Note: sorting by multiple columns is not supported in map reduce mode.

## Filtering (MapReduce mode)

Filtering is somewhat limited in this mode.

- Multiple filters are not supported.
- When filer applied to field other than id field, sort should be applied to this field either.
- Currently "neq" and "gt" operators are not supported.

For supported scenarios, just use
[DataSource filter](<http://docs.telerik.com/kendo-ui/api/javascript/data/datasource#configuration-filter>). It will be used such as serverFiltering option is set to true. 

## Filtering and sorting (PouchDB Find mode) 

Filters and sorting can be as complex as pouchdb-find supports.

```js
var dataSource = new kendo.data.PouchableDataSource({
    type: "pouchdb",
    filter: { field: "series", operator: "eq", value: "Mario" },
    sort: [ { field: "series", dir: "desc"}, { field: "debut", dir: "desc"} ],
    transport: {
        pouchdb: {
            db: db,
            queryPlugin: "pouchdb-find", //queryPlugin is mapreduce by default
            idField: "_id"
        }
    });
```

Indexes should be defined beforehand, or query will fail.
When filtering or sorting on, say, ProductID field which is id field, add index on _id field. This
is because internally ProductID will be stored inside the _id field.

defaultView and fieldViews cannot be used in this mode, do not mix modes.

Note: when sorting in this mode, be careful with fields that contain null values. When no filter specified when sorting, selector with *$exists=true* condition will be used, so rows with null 
values in sort field will not be selected. This is limitation, AFAIK, of pouchdb-find.

## More examples

There is a lot of code to learn from in
[test specs](<https://github.com/terikon/kendo-pouchdb/blob/master/tests/spec/kendo-pouchdbSpec.js>). Use it to your advantage.

# API

In general, **kendo-pouchdb** acts as adapter between Kendo's DataSource object and PouchDB
database.

kendo.data.PouchableDataSource object extends kendo.data.DataSource and can be used as casual
DataSource.

To activate kendo-pouchdb, set type option of dataset to "pouchdb", and provide pouchdb transport
in datasource configuration.

## kendo.data.PouchableDataSource

- type: set to "pouchdb".

## pouchdb transport

- db (mandatory). PouchDB database instance.
- idField (mandatory). _id or any other field of model that will be used as id field.
- queryPlugin (optional). "mapreduce" or "pouchdb-find". Default is "mapreduce".
- defaultView (optional)(only in maprecude mode). If set, data will be fetched using this
PouchDB view, when sorting by id.
- fieldViews (optional)(only in maprecude mode). Object of 'field':'view name' pairs for
sorting. View name is in format 'users/byName'.

# Work status

Implemented
- CRUD operations on PouchDB database arrive in DataSource in form of push events.
- CRUD operations on DataSource are synced with PouchDB when sync method is called.
- Tests specs for implemented functionality.
- Support for PouchDB Collate in _id.
- Implement sorting (with reduce and db.find).
- Add support for bower.
- Add to npmjs.
- Implement paging.
- Implement filtering (with mapreduce and db.find).
- Make it possible to specify default PouchDB view to work with.
- Add demos.
- Write documentation.

# Things to consider for future versions

- Implement grouping.
- Batch update option support.
- Add jsbin/dojo examples.
- Add the lib to CDN. 

# Use with Couchbase Mobile

There is POC project that tries to binds Kendo Grid with
[Couchbase Mobile](<http://www.couchbase.com/nosql-databases/couchbase-mobile>), via
[Couchbase Lite Phonegap plugin](<https://github.com/couchbaselabs/Couchbase-Lite-PhoneGap-Plugin>). See [kendo-pouchdb-app](<https://github.com/terikon/kendo-pouchdb-app>) project.

Currently it's not functional due to lack of compatibility between PouchDB and Couchbase Mobile,
but let's hope for
[advance in this area](<https://github.com/couchbase/couchbase-lite-android/issues/227>).

# Contribute

Use [GitHub issues](https://github.com/terikon/kendo-pouchdb/issues) and [Pull Requests](https://github.com/terikon/kendo-pouchdb/pulls).

Ideas are welcome as well :)

To build:
	
    npm run build

Before committing, please run jshint:

    npm run jshint

To run tests:

    npm run test

Tests reside in [tests/spec](https://github.com/terikon/kendo-pouchdb/tree/master/tests/spec) folder.

Tests are also runnable in browser and debuggable with [tests/SpecRunner.html](
<https://github.com/terikon/kendo-pouchdb/tree/master/tests/SpecRunner.html>).