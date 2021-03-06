"use strict";

let nforce = require('nforce'),

    SF_CLIENT_ID = process.env.SF_CLIENT_ID,
    SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET,
    SF_USER_NAME = process.env.SF_USER_NAME,
    SF_PASSWORD = process.env.SF_PASSWORD;

let org = nforce.createConnection({
    clientId: SF_CLIENT_ID,
    clientSecret: SF_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/oauth/_callback',
    mode: 'single',
    autoRefresh: true
});

let login = () => {
    org.authenticate({username: SF_USER_NAME, password: SF_PASSWORD}, err => {
        if (err) {
            console.log("Authentication Errorurr");
            console.error("Authentication error");
            console.error(err);
        } else {
            console.log("Authentication successful");
        }
    });
};

let findProperties = (params) => {
    let where = "";
    if (params) {
        let parts = [];
        if (params.id) parts.push(`id='${params.id}'`);
        if (params.city) parts.push(`New177__city__c='${params.city}'`);
        if (params.bedrooms) parts.push(`New177__beds__c=${params.bedrooms}`);
        if (params.priceMin) parts.push(`New177__price__c>=${params.priceMin}`);
        if (params.priceMax) parts.push(`New177__price__c<=${params.priceMax}`);
        if (parts.length>0) {
            where = "WHERE " + parts.join(' AND ');
            console.log('where'+where);
        }
    }
    return new Promise((resolve, reject) => {
        let q = `SELECT id,New177__title__c,New177__address__c, New177__city__c, New177__state__c,
        New177__price__c, New177__beds__c,New177__baths__c, New177__picture__c FROM New177__Property__c
                ${where}
                LIMIT 5`;
        /*let q = `SELECT id  ,name                 
                FROM account LIMIT 1`;*/
        org.query({query: q}, (err, resp) => {
            console.log('q-->'+q);
            console.log('q-->'+q);
            if (err) {
                reject("An error as occurred");
            } else {
                console.log('q-response->'+resp.records);
                resolve(resp.records);
            }
        });
    });

};

let findPropertiesByCategory = (category) => {
    return new Promise((resolve, reject) => {
        let q = `SELECT id,
                    title__c,
                    address__c,
                    city__c,
                    state__c,
                    price__c,
                    beds__c,
                    baths__c,
                    picture__c
                FROM property__c
                WHERE tags__c LIKE '%${category}%'
                LIMIT 5`;
        console.log(q);
        org.query({query: q}, (err, resp) => {
            if (err) {
                console.error(err);
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findPriceChanges = () => {
    return new Promise((resolve, reject) => {
        let q = `SELECT
                    OldValue,
                    NewValue,
                    CreatedDate,
                    Field,
                    Parent.Id,
                    Parent.title__c,
                    Parent.address__c,
                    Parent.city__c,
                    Parent.state__c,
                    Parent.price__c,
                    Parent.beds__c,
                    Parent.baths__c,
                    Parent.picture__c
                FROM property__history
                WHERE field = 'Price__c'
                ORDER BY CreatedDate DESC
                LIMIT 3`;
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });
};


let createCase = (propertyId, customerName, customerId) => {

    return new Promise((resolve, reject) => {
        let c = nforce.createSObject('Case');
        c.set('subject', `Contact ${customerName} (Facebook Customer)`);
        c.set('description', "Facebook id: " + customerId);
        c.set('origin', 'Facebook Bot');
        c.set('status', 'New');
        c.set('New177__Property__c', propertyId);

        org.insert({sobject: c}, err => {
            if (err) {
                console.error(err);
                reject("An error occurred while creating a case");
            } else {
                resolve(c);
            }
        });
    });

};

//Added to Display Top Opportunities

let SearchOpportunities = (params) => {
    return new Promise((resolve, reject) => {
        console.log('params.Oppcount'+params.Oppcount);
        let q = `SELECT Id, IsDeleted, AccountId, IsPrivate, Name, Description,
         StageName, Amount, Probability, ExpectedRevenue, TotalOpportunityQuantity,
          CloseDate, Type, NextStep, LeadSource, IsClosed, IsWon, ForecastCategory, 
        CampaignId, HasOpportunityLineItem, Pricebook2Id, OwnerId FROM Opportunity
        ORDER BY Amount LIMIT  ${params.Oppcount}`;
        console.log(q);
        org.query({query: q}, (err, resp) => {
            if (err) {
                console.error(err);
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

login();

exports.org = org;
exports.findProperties = findProperties;
exports.findPropertiesByCategory = findPropertiesByCategory;
exports.findPriceChanges = findPriceChanges;
exports.createCase = createCase;
exports.SearchOpportunities = SearchOpportunities;
