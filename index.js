const core = require('@actions/core');
const fs = require('fs');
//const actionUtils = require('../action-utils.js');

const main = async () => {
  try {
    //const [core] = await actionUtils.installAndRequirePackages("@actions/core");
    const learningPathDirectory = core.getInput('learningPathsDirectory', { required: true });
    const learningPathHashFile = core.getInput('learningPathHashFile', { required: true });
    const oldHash = core.getInput('oldHash', { required: true });
    const newHash = core.getInput('newHash', { required: true });

    let modifiedFiles = [];
    
    // Write New Hash to File
    fs.writeFileSync(learningPathHashFile, newHash, "utf8");

    modifiedFiles.push(learningPathHashFile)

    core.setOutput('modifiedFiles', modifiedFiles.join(' '))
    //actionUtils.writeFile(learningPathHashFile, newHash);

    // Scan each file in the learningPaths directory
    fs.readdir(learningPathDirectory, (err, files) => {
      files.forEach(learningPathFile => {
        try {
          const learningPathFileFullPath = learningPathDirectory + "/" + learningPathFile
          const learningPathFileContent = fs.readFileSync(learningPathFileFullPath, "utf8")

          console.log("Learning Path File: " + learningPathFileFullPath);

          // Replace all instances of the oldHash with the newHash
          const replacedLearningPathFileContent = learningPathFileContent.replace(oldHash, newHash);

          // Use actionUtils to write the updated learning path file to the repo
          fs.writeFileSync(learningPathDirectory + "/" + learningPathFile, replacedLearningPathFileContent, "utf8");
          //actionUtils.writeFile(learningPathDirectory + "/" + learningPathFile, learningPathFileContentStr);


          if (learningPathFileContent !== replacedLearningPathFileContent) {
            modifiedFiles.push(learningPathFileFullPath)
            core.setOutput('modifiedFiles', modifiedFiles.join(' '))
          }


        } catch (error) {
          console.log("Error: " + error)
          console.log("Could not find learning path file: " + learningPathFile)
        }
      });
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

// Call the main function to run the action
main();