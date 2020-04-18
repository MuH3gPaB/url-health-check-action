const core = require("@actions/core");
const proc = require("child_process");
const duration = require("duration-js");

function asBoolean(str) {
    return str && ["yes", "true", "y", "1"].includes(str);
}

const processConfig = {
    stdio: "inherit",
    encoding: "utf8",
};

function curl(url, { maxAttempts, retryDelaySeconds, followRedirect }) {
    let retrySettings = "";
    if (maxAttempts > 1) {
        retrySettings = `--retry ${maxAttempts} --retry-delay ${retryDelaySeconds}`;
    }
    let redirectSettings = followRedirect ? '-L' : '';

    core.info(`Checking ${url}`);
    let out = proc.execSync(`curl --fail -sv ${redirectSettings} ${url} ${retrySettings}`, processConfig);
    core.info(out);
}

try {
    let url = core.getInput("url", {required: true});
    let maxAttemptsString = core.getInput("max-attempts");
    let retryDelay = core.getInput("retry-delay");
    let followRedirectString = core.getInput("follow-redirect");

    let retryDelaySeconds = duration.parse(retryDelay).seconds();
    let maxAttempts = parseInt(maxAttemptsString);
    let followRedirect = asBoolean(followRedirectString);

    curl(url, {maxAttempts, retryDelaySeconds, followRedirect});

    core.info("Success")
} catch (e) {
    console.error("Error running action", e);
    core.setFailed(e.message);
}
