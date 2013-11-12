// Print all of the news items on hackernews
var jsdom = require("jsdom"),
	fs = require("fs");

/*
 * array of objects of extracted job offers in form:
 *  - title
 *  - perex
 *  - company
 *  - city
 *  - date
 *  - link (external)
 */
var new_jobs = [],
    next_page = '',
    stop = false;

function extract(url) {
    jsdom.env({
        url: url,
        scripts: ["http://code.jquery.com/jquery.min.js"],
        done: function(errors, window) {
            var $ = window.$;

            $("#joblist .list table tr").each(function() {
            	var temp = {};

            	temp.title 		= $('td .favourite h3 a', this).text();
				temp.perex 		= $('td p', this).text();
				temp.company 	= $('td .jobInfo .companyName', this).text();
				temp.city 		= $('td .jobInfo li span[rel="locality"]', this).text();
				temp.date 		= $('td .jobInfo li em[rel="age"]', this).text();
				temp.link 		= $('td .favourite h3 a', this).attr('href');

				new_jobs.push(temp);
                next_page = $('#pager .next a[name="s_dalsi"]').attr('href');

            });

            console.log(new_jobs);
            console.log(next_page);

            if (stop){
                save_to_db();
            } else {
                extract(next_page);
            }
        }
    });
}

extract('http://www.jobs.cz/search/?section=positions', undefined);
