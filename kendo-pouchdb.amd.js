/* global define */

//Loads kendo-pouchdb after kendo library for AMD.
//To be used with map option of RequireJS configuration:
//  shim: {
//      "kendo-pouchdb.amd": { deps: ["kendo"] }
//  },
//  map: {
//      '*': {
//          'kendo': 'kendo-pouchdb.amd'
//      },
//      'kendo-pouchdb.amd': { 'kendo': 'kendo' }
//  }
define(['kendo', 'kendo-pouchdb'], function (kendo) {
	'use strict';
	return kendo;
});