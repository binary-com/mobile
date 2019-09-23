module.exports = function (context) { 
    console.log('Running 011_add_cert_fingerprint hook');

    const path = require('path');
    const shell = require('shelljs');

    const rootDir = context.opts.projectRoot;
    const platformPath = path.join(rootDir, 'platforms');

    const qaMachines = context.opts.options.qa_machine ? context.opts.options.qa_machine.split(',') : [];

    run();

    function run() {

        const fp = retriveFP('frontend.binaryws.com');
        writeFP(fp, 'serverCertFP');

        const currentBranch = shell.exec("echo | git branch | grep '*'");

        if(currentBranch && currentBranch.stdout && currentBranch.stdout.indexOf('qa_version') > -1) {
            const qaFP = [];

            qaMachines.forEach((m) => {
                const cert = {
                    url: m,
                    fp : retriveFP(m),
                };

                cert.fp ? qaFP.push(cert) : null;
            });

            writeFP(qaFP, 'qaMachinesCertFP');
        }
    }

    function retriveFP(url, variableName) {
        const fpResult = shell.exec(
            'echo | ' + 
            `openssl s_client -showcerts -connect ${url}:443 -servername ${url} | ` +
            'openssl x509 -fingerprint -noout'
        );

        if (fpResult && fpResult.stdout) {
            const result = /^SHA1 Fingerprint=(.+)/.exec(fpResult.stdout)

            if (result && result.length > 1) {
                return result[1].replace(/:/g, ' ');
            }

            return null;
        }

        return null;

    }

    function writeFP(fp, variableName) {
        if (fp) {
            const wwwPath = path.join(platformPath, 'android', 'app', 'src', 'main', 'assets', 'www', 'js', 'configs', 'app.config.js');
            const substitute = typeof fp === 'string' ? `${variableName}: "${fp}",` : `${variableName}: ${JSON.stringify(fp)},`
            shell.sed('-i', RegExp(`${variableName}.*`), substitute, wwwPath);
        }
    }
}
