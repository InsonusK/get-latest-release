import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
    // Get input values
    const myToken = core.getInput('myToken');
    const excludeReleaseTypes = core.getInput('exclude_types').split('|');
    const topList = +core.getInput('view_top');

    // Set parameters
    const excludeDraft = excludeReleaseTypes.some(f => f === "draft");
    const excludePrerelease = excludeReleaseTypes.some(f => f === "prerelease");
    const excludeRelease = excludeReleaseTypes.some(f => f === "release");

    const octokit = github.getOctokit(myToken);

    // Load release list from GitHub
    let releaseList = await octokit.repos.listReleases({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        per_page: topList,
        page: 1
    });

    // Search release list for latest required release
    if (core.isDebug()) {
        core.debug(`Found ${releaseList.data.length} releases`);
        releaseList.data.forEach((el) => WriteDebug(el));
    }

    for (let i = 0; i < releaseList.data.length; i++) {
        let releaseListElement = releaseList.data[i];

        if ((!excludeDraft && releaseListElement.draft) ||
            (!excludePrerelease && releaseListElement.prerelease) ||
            (!excludeRelease && !releaseListElement.prerelease && !releaseListElement.draft)) {
            core.debug(`Chosen: ${releaseListElement.id}`);
            setOutput(releaseListElement);
            break;
        }
    }
}


/**
 * Setup action output values
 * @param release - founded release
 */
function setOutput(release: { id: number, tag_name: string, created_at: string, draft: boolean, prerelease: boolean }): void {
    core.setOutput('id', release.id);
    core.setOutput('name', release.id);
    core.setOutput('tag_name', release.tag_name);
    core.setOutput('created_at', release.created_at);
    core.setOutput('draft', release.draft);
    core.setOutput('prerelease', release.prerelease);
    core.setOutput('release', !release.prerelease && !release.draft);
}

/**
 * Write debug
 * @param release - founded release
 */
function WriteDebug(release: { id: number, tag_name: string, created_at: string, draft: boolean, prerelease: boolean, name: string }): void {
    core.debug(`id: ${release.id}`);
    core.debug(`name: ${release.name}`)
    core.debug(`tag_name: ${release.tag_name}`);
    core.debug(`created_at: ${release.created_at}`);
    core.debug(`draft: ${release.draft}`);
    core.debug(`prerelease: ${release.prerelease}`);
}

run();
