module.exports.logPath = (data, __filename) => {
  const filePath = __filename.split("\\");
  console.log(data, filePath[filePath.length - 1]);
};
