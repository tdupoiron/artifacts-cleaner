// Require libraries
const { Octokit } = require("@octokit/rest");
const fs = require('fs');

// Init constants
const org = "tdupoiron-org";
const octokit = new Octokit(
    {
        auth: process.env.GITHUB_TOKEN,
        baseUrl: "https://api.github.com"
    }
);

// List all repositories
async function getRepos(org) {

    return octokit.rest.repos.listForOrg({
        org: org,
        type: "private"
    }).then(({ data, headers, status }) => {
        return data;
    });
};

// List all artifacts
async function getArtifacts(owner, repo) {

    return octokit.rest.actions.listArtifactsForRepo({
        owner: owner,
        repo: repo,
        per_page: 100
    }).then(({ data, headers, status }) => {
        return data;
    }
    );
};

async function main() {

    var artifactsOut = [];

    // Get all repositories
    const repos = await getRepos(org);

    // Get all artifacts
    for (const i in repos)
    {
        const currentRepo = repos[i];
        const artifacts = await getArtifacts(org, currentRepo.name);

        // Build output format for each artifact
        for (const j in artifacts.artifacts)
        {
            const currentArtifact = artifacts.artifacts[j];

            const output = {
                "repoId": currentRepo.id,
                "repoName": currentRepo.name,
                "repoVisibility": currentRepo.visibility,
                "repoUrl": currentRepo.html_url,
                "repoOwnerType": currentRepo.owner.type,
                "repoOwnerLogin": currentRepo.owner.login,
                "repoOwnerUrl": currentRepo.owner.html_url,
                "artifactId": currentArtifact.id,
                "artifactName": currentArtifact.name,
                "artifactDownloadUrl": currentArtifact.archive_download_url,
                "workflowRunId": currentArtifact.workflow_run.id,
                "workflowRunUrl": currentRepo.html_url + "/actions/runs/" + currentArtifact.workflow_run.id,
                "size": currentArtifact.size_in_bytes,
                "created_at": currentArtifact.created_at,
                "expires_at": currentArtifact.expires_at
            };

            artifactsOut.push(output);
        }
    }

    // Write output to file
    fs.writeFileSync('docs/assets/data/artifacts.json', JSON.stringify(artifactsOut, null, 2));

}

main();
