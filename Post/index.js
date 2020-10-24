const fetch = require('node-fetch');

module.exports = async function (context, req) {
    let params;
    try {
        params = new URLSearchParams(req.body);
    } catch (error) {
        context.res = {
            status: 400,
            body: `Body must be 'application/x-www-form-urlencoded' with 'source' and 'target': '${req.body}'`
        };
    }
    const source = params.get('source');
    const target = params.get('target');

    if (new URL(target).hostname !== process.env.Hostname) {
        context.res = {
            status: 400,
            body: `Target '${target}' is not on domain '${process.env.Hostname}'\n`
        };
        return;
    }

    const table = [];
    context.bindings.tableBinding = table;

    if (!(await fetch(target)).ok) {
        context.res = {
            status: 400,
            body: `Unable to fetch target '${target}'\n`
        };
        return;
    }

    let text;
    try {
        const resp = await fetch(source);
        text = await resp.text();
    }
    catch (error) {
        context.res = {
            status: 400,
            body: `Unable to fetch source '${source}'\n`
        };
        return;
    }

    const sourceUrl = new URL(source);
    const match = text.match(/<title>(.*?)<\/title>/);
    let title;
    if (match && match.length > 1) {
        title = match[1];
    } else if (sourceUrl.hostname === 'twitter.com') {
        title = `${sourceUrl.pathname.split('/')[1]} on Twitter`;
    } else if (sourceUrl.hostname === 'linkedin.com') {
        title = `LinkedIn`;
    } else {
        title = source;
    }

    table.push({
        PartitionKey: encodeURIComponent(target),
        RowKey: encodeURIComponent(source),
        source,
        target,
        title
    });

    context.res = {
        status: 204
    };

    context.done();
}