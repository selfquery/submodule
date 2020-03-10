const fs = require('fs');
const argv = require('yargs').argv;
const child_process = require('child_process');

const LOG = argv.sub_loglevel || 'error';
const PATH = argv.sub_path || process.cwd();

function recursive (path) {
  fs.readdirSync(path).forEach(file => {

    if (file === '.gitmodules') git_submodules(`${path}`);
    if (fs.lstatSync(`${path}/${file}`).isDirectory() && file != 'node_modules') recursive(`${path}/${file}`);

  });
};

function git_submodules (git_path) {
  let git = fs.readFileSync(`${git_path}/.gitmodules`).toString().split(/\n\t/);
  for (let m in git) {
    if (git[m].indexOf('path') > -1) install_packages(`${git_path}/${git[m].split(' ')[2]}`);
  };
};

function install_packages (path) {
  fs.readdirSync( path ).forEach(file => {
    let proceed = argv.sub_reload || fs.existsSync(`${path}/node_modules`) === false;
    if (file === 'package.json' && proceed) {
      child_process.execSync(`cd ${path} && npm i --loglevel=${LOG}`);
    };
  });
};

recursive(PATH);
