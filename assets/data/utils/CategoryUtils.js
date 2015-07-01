'use strict';



var lodash = require('lodash');



var categories = [
    'agegrp',
    'education',
    'ethnicity',
    'firmage',
    'firmsize',
    'industry',
    'race',
    'sex',
];



var tables = {
    'rh_fa' : [ 'race' , 'ethnicity' , 'firmage' , 'industry' ] ,
    'rh_fs' : [ 'race' , 'ethnicity' , 'firmsize', 'industry' ] ,
    'sa_fa' : [ 'sex'  , 'agegrp'    , 'firmage' , 'industry' ] ,
    'sa_fs' : [ 'sex'  , 'agegrp'    , 'firmsize', 'industry' ] ,
    'se_fa' : [ 'sex'  , 'education' , 'firmage' , 'industry' ] ,
    'se_fs' : [ 'sex'  , 'education' , 'firmsize', 'industry' ] ,
};



var getValidCombosForCategory = (function () {
    var combos = lodash.values(tables);

    return function (category) {
        return lodash.union.apply(null, combos.filter(function (combo) {
            return lodash.includes(combo, category);
        })); 
    };
}());



var validCombos = lodash.reduce(categories, function (result, category) { 
    result[category] = getValidCombosForCategory(category); 
    return result;
}, {});



function getRequiredTablePrefix (categories) {

    var prefixes = Object.keys(tables),
        i;

    for (i = 0; i < prefixes.length; ++i) {
        if (!lodash.difference(categories, tables[prefixes[i]]).length) {
            return prefixes[i];
        }
    }
}



function newDrilldownSelectionGenerator() {
    var selector = {
        selectedCategories : [],
        validDrilldowns    : categories,
    };

    selector.select = function (category) {
        selector.selectedCategories[selector.selectedCategories.length] = category;
    
        selector.validDrilldowns = lodash.intersection(selector.validDrilldowns, 
                                                       validCombos[category]);
    };

    selector.deselect = function (category) {
        selector.selectedCategories = lodash.pull(selector.selectedCategories, category);

        selector.validDrilldowns = 
                    lodash.intersection.apply(null, 
                                              selector.selectedCategories.map(function(category) { 
                                                    return validCombos[category];
                                              }));
    };

    return selector;
}



module.exports = { 
    getRequiredTablePrefix         : getRequiredTablePrefix,
    newDrilldownSelectionGenerator : newDrilldownSelectionGenerator,
};

