module.exports = notifyRelease
module.exports.processReleaseBody = processReleaseBody

function processReleaseBody(releaseBody) {
  // basic markdown into slack syntax
  return (
    releaseBody
      // headers
      .replace(/#+\s+(.+)/g, '*$1*')
      // dotted lists
      .replace(/\* /g, '- ')
      // bold
      .replace(/\*+/g, '*')
      // usernames
      .replace(/@(.+)/g, '<https://github.com/$1|@$1>')
      // github links
      .replace(/https:\/\/github.com\/.+\/(?:pull|issue)\/(.+)/g, '<$&|#$1>')
  )
}

async function notifyRelease({ require, github, context }) {
  const https = require('https')

  const { data: release } = await github.rest.repos.getReleaseByTag({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag: context.payload.release.tag_name
  })

  return new Promise((resolve, reject) => {
    const req = https.request(
      process.env.SLACK_WEBHOOK_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      res => (res.statusCode === 200 ? resolve : reject)(res.statusMessage)
    )

    req.write(
      JSON.stringify({
        channel: '@simone',
        attachments: [
          {
            fallback: `<${release.html_url}|New release ${release.tag_name}>`,
            pretext: `<${release.html_url}|New release ${release.tag_name}>`,
            fields: [
              {
                value: processReleaseBody(release.body),
                short: false
              }
            ]
          }
        ]
      })
    )

    req.end()
  })
}
