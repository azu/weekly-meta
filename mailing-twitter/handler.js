'use strict';
const DEBUG = process.env.DEBUG ? true : false;
const API_IFTTT_TO_TWITTER = require("./secret.json").API_IFTTT_TO_TWITTER;
const getTitle = require('get-title');
const hyperquest = require('hyperquest');
const extractLinkAndTitle = require('extract-links-mail-magazine').extractLinkAndTitle;
const jsdom = require('jsdom');
const fetch = require("node-fetch");
const getTitleAtUrl = (url) => {
    const stream = hyperquest(url);
    return getTitle(stream);
};
const createContent = (sourceTitle, title, url) => {
    return `${url}\n${title}\n via ${sourceTitle}`
};
const postToTwitter = (content) => {
    return fetch(API_IFTTT_TO_TWITTER, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "value1": content
        })
    }); // not parse
};
/**
 * Parse url and resolve with parsed urls
 * @param {string}url
 * @returns {Promise.<[string, string][]>}
 */
const getLinksFromMlURL = (url) => {
    if (DEBUG) {
        console.log(`Parse URL: ${url}`);
    }
    return new Promise((resolve, reject) => {
        jsdom.env({
            url: url,
            done: function(err, window) {
                if (err) {
                    return reject(error);
                }
                const links = extractLinkAndTitle(window.location.href, window.document);
                resolve(links);
            }
        });
    });
};

module.exports.send = (event, context, cb) => {
    const body = event.body;
    if (!body) {
        return cb(new Error("No body"));
    }
    const mailMagazineURL = body.url;
    const mailMagazineTitle = body.title;
    if (!(mailMagazineURL && mailMagazineTitle)) {
        cb(new Error(`Need url && title`));
    }
    getLinksFromMlURL(mailMagazineURL).then(siteList => {
        console.log(`
MailMagazineTitle: ${mailMagazineTitle}
MailMagazineURL: ${mailMagazineURL}
Links count: ${siteList.length}
`);
        if (DEBUG) {
            console.log(`links:`, JSON.stringify(siteList, null, 4));
            return;
        }
        const postingPromises = siteList.map(site => {
            const articleURL = site[0];
            const articleTitle = site[1];
            const content = createContent(mailMagazineTitle, articleTitle, articleURL);
            return postToTwitter(content);
        });
        return Promise.all(postingPromises);
    }).then(results => {
        console.log("Success!");
        cb(null);
    }).catch(error => {
        console.error("Error!", error);
        cb(error);
    });
};
