module.exports = async function({ require, github, context }) {
    const https = require('https')

    const { data: release } = await github.rest.repos.getReleaseByTag({
        owner: context.repo.owner,
        repo: context.repo.repo,
        tag: context.payload.release.tag_name
    })
    
    return new Promise((resolve, reject) => {
        const req = https.request(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            }
        }, res => {
            resolve(res.statusCode)
        })
        
        req.write(JSON.stringify({
            channel: '@simone',
            attachments: [{
                fallback: `New release ${release.tag_name}`,
                pretext:   `New release ${release.tag_name}`,
                fields: [{
                    // title: '*{version}*',
                    value: release.body
                    .replace(/#+\s+(.+)/g, '*$1*')
                    .replace(/\* /g, '\n- ')
                    .replace(/\*+/g, '*'),
                    short: false
                }]
            }]
        }))

        req.end()
    })
}