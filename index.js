const core = require('@actions/core');
const fs = require('fs');
//const actionUtils = require('../action-utils.js');

const suggestionsSeparator = ',';
const oldNewLinkSeparator = ' -> ';
let modifiedFiles = [];

function AppendModifiedFiles(path)
{
  modifiedFiles.push(path)
  core.setOutput('modifiedFiles', modifiedFiles.join(' '))
}

const main = async () => {
  try {
    const learningPathDirectory = core.getInput('learningPathsDirectory', { required: true });
    const learningPathHashFile = core.getInput('learningPathHashFile', { required: true });
    const suggestions = core.getInput('suggestions', { required: false });
    const oldHash = core.getInput('oldHash', { required: true });
    const newHash = core.getInput('newHash', { required: true });

    fs.writeFileSync(learningPathHashFile, newHash, "utf8");
    AppendModifiedFiles(learningPathHashFile)

    // Scan each file in the learningPaths directory
    fs.readdir(learningPathDirectory, (_, files) => {
      files.forEach(learningPathFile => {
        try {
          const fullPath = learningPathDirectory + "/" + learningPathFile
          const content = fs.readFileSync(fullPath, "utf8")

          var replacedContent = content

          if (suggestions !== null && suggestions.trim() !== "") {
            const suggestionsArray = suggestions.split(suggestionsSeparator)
            suggestionsArray.forEach(suggestion => {
              const suggestionArray = suggestion.split(oldNewLinkSeparator)
              var oldLink = suggestionArray[0]
              var newLink = suggestionArray[1]
              oldLink = oldLink.substring(oldLink.indexOf('(') + 1, oldLink.lastIndexOf(')'))
              newLink = newLink.substring(newLink.indexOf('(') + 1, newLink.lastIndexOf(')'))
              replacedContent = replacedContent.replace(new RegExp(oldLink, 'g'), newLink);
            })
          }

          replacedContent = replacedContent.replace(new RegExp(oldHash, 'g'), newHash);

          fs.writeFileSync(learningPathDirectory + "/" + learningPathFile, replacedContent, "utf8");
          //actionUtils.writeFile(learningPathDirectory + "/" + learningPathFile, learningPathFileContentStr);

          if (content !== replacedContent) {
            AppendModifiedFiles(fullPath)
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