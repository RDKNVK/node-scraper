// Print all of the news items on hackernews
var jsdom = require("jsdom"),
    sqlite3 = require("sqlite3").verbose(),
    db = new sqlite3.Database('job.sqlite'),
    ins_stmt = db.prepare("INSERT INTO job VALUES(?,?,?,?,?,?,?)");/*,
    check_stmt = db.prepare("SELECT count(*) FROM job WHERE webpage = ? AND title = ? AND link = ?");
*/
/*
 * array of objects of extracted job offers in form:
 *  - webpage
 *  - title
 *  - perex
 *  - company
 *  - city
 *  - date
 *  - link (external)
 */
var new_jobs = [],
    next_page = '',
    stop = true;

function extract(url) {
    jsdom.env({
        url: url,
        scripts: ["http://code.jquery.com/jquery.min.js"],
        done: function(errors, window) {
            var $ = window.$;

            console.log(errors);

            $("#joblist .list table tr").each(function() {
            	var temp = {};
                temp.webpage    = 'http://www.jobs.cz';
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

function save_to_db () {
    console.log('attempting to save db');
    for (var i = 0, ii = new_jobs.length; i < ii; i++){
        var job = new_jobs[i];
        ins_stmt.run(job.webpage, job.title, job.perex, job.company, job.city, job.date, job.link);
    }

    ins_stmt.finalize();
    db.close();
}

extract('http://www.jobs.cz/search/?section=positions', undefined);
