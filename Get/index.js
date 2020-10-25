module.exports = async function (context, req) {
    const key = encodeURIComponent(req.query.target);
    const mentions = context.bindings.tableBinding
        .filter(item => item.PartitionKey === key)
        .map(({ source, title }) => ({ source, title }));
    context.res = {
        body: mentions
    };
}