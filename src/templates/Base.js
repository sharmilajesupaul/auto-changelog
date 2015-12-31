export default class Base {
  logHeader = '# Change Log\nAll notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).\n\nGenerated by [auto-changelog](https://github.com/CookPete/auto-changelog)'

  unreleasedTitle = 'Unreleased'
  mergesTitle = 'Merged'
  fixesTitle = 'Fixed'
  commitsTitle = 'Commits'

  commitListLimit = 3
  commitHashLength = 7

  constructor (origin) {
    this.origin = origin
  }

  formatDate = (date) => {
    return date.slice(0, 10)
  }

  render = (releases) => {
    return [
      this.logHeader,
      releases.map(this.renderRelease).join('\n\n\n')
    ].join('\n\n\n') + '\n'
  }

  renderRelease = (release, index, releases) => {
    const previousRelease = releases[index + 1]
    let log = [ this.renderReleaseHeading(release, previousRelease) ]
    const merges = this.renderMerges(release.merges)
    const fixes = this.renderFixes(release.fixes)
    log = log.concat(merges).concat(fixes)
    if (merges.length + fixes.length === 0) {
      log = log.concat(this.renderCommits(release.commits))
    }
    return log.join('\n\n')
  }

  renderReleaseHeading = (release, previousRelease) => {
    const title = this.renderReleaseTitle(release, previousRelease)
    const date = release.date ? ' - ' + this.formatDate(release.date) : ''
    return `## ${title}${date}`
  }

  renderReleaseTitle = (release, previousRelease) => {
    let heading = release.tag || this.unreleasedTitle
    if (previousRelease) {
      heading = `[${heading}](${this.origin}/compare/${previousRelease.tag}...${release.tag || 'HEAD'})`
    }
    return heading
  }

  renderList = (title, list) => {
    const heading = title ? `### ${title}\n` : ''
    return heading + list
  }

  renderMerges = (merges) => {
    if (merges.length === 0) return []
    const list = merges.map(this.renderMerge).join('\n')
    return this.renderList(this.mergesTitle, list)
  }

  renderMerge = ({ pr, message }) => {
    return `* ${pr}: ${message}`
  }

  renderFixes = (fixes) => {
    if (fixes.length === 0) return []
    const list = fixes.map(this.renderFix).join('\n')
    return this.renderList(this.fixesTitle, list)
  }

  renderFix = ({ fixes, commit }) => {
    const numbers = fixes.map(this.renderFixNumber).join(', ')
    return `* ${numbers}: ${commit.subject}`
  }

  renderFixNumber = (string) => {
    return string.replace(this.origin + '/issues/', '#')
  }

  renderCommits = (commits) => {
    if (commits.length === 0) return []
    const list = commits
      .sort(this.sortCommits)
      .slice(0, this.commitListLimit)
      .map(this.renderCommit)
      .join('\n')
    return this.renderList(this.commitsTitle, list)
  }

  renderCommit = ({ hash, subject }) => {
    return `* ${hash.slice(0, this.commitHashLength)}: ${subject}`
  }

  sortCommits = (a, b) => {
    // If we have to list commits, list the juicy ones first
    return b.insertions + b.deletions - a.insertions + a.deletions
  }
}
