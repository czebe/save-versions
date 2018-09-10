#!/usr/bin/env node

import jsonFile from "jsonfile";
import gitsha from "gitsha";
import path from "path";
import minimist from "minimist";
import semverRegex from "semver-regex";

const argv = minimist(process.argv);

const getSha = () =>
  new Promise((resolve, reject) => {
    gitsha(__dirname, (error, output) => {
      if (error) reject(error);
      else resolve(output);
    });
  });

const saveGitSha = output => {
  getSha().then(sha => {
    jsonFile.writeFile(
      path.resolve(output),
      {
        id: sha
      },
      { spaces: 2 },
      err => {
        if (err) throw new Error(err);
      }
    );
  });
};

const saveDependencyVersion = (dependencies, output) => {
  jsonFile
    .readFile(path.resolve(path.join(process.cwd(), "package.json")))
    .then(pkg => {
      jsonFile.writeFile(
        path.resolve(output),
        dependencies.split(",").reduce((result, dependency) => {
          result[dependency] =
            (pkg.dependencies[dependency] &&
              semverRegex().exec(pkg.dependencies[dependency])[0]) ||
            0;
          return result;
        }, {}),
        { spaces: 2 },
        err => {
          if (err) throw new Error(err);
        }
      );
    })
    .catch(error => {
      throw new Error(error);
    });
};

if (argv.gitsha) {
  saveGitSha(argv.gitsha);
}

if (argv.dependencies && argv.output) {
  saveDependencyVersion(argv.dependencies, argv.output);
}
