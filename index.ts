import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
    const myToken = core.getInput('myToken');
    const excludeReleaseTypes = core.getInput('exclude_types').split('|');
    const topList = +core.getInput('view_top');

    const excludeDraft = excludeReleaseTypes.some(f => f === "draft");
    const excludePrerelease = excludeReleaseTypes.some(f => f === "prerelease");
    const excludeRelease = excludeReleaseTypes.some(f => f === "release");

    const octokit = github.getOctokit(myToken);

    let repoList = await octokit.repos.listReleases({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        per_page: topList,
        page: 1
    });

    for (let i = 0; i < repoList.data.length; i++) {
        let repoListElement = repoList.data[i];
        if ((!excludeDraft && repoListElement.draft) ||
            (!excludePrerelease && repoListElement.prerelease) ||
            (!excludeRelease && !repoListElement.prerelease && !repoListElement.draft)) {
            setOutput(repoListElement);
            break;
        }
    }
}

function setOutput(element: { id: number, tag_name: string, created_at: string, draft: boolean, prerelease: boolean }): void {
    core.setOutput('id', element.id);
    core.setOutput('tag_name', element.tag_name);
    core.setOutput('created_at', element.created_at);
    core.setOutput('draft', element.draft);
    core.setOutput('prerelease', element.prerelease);
    core.setOutput('release', !element.prerelease && !element.draft);
}

run();
