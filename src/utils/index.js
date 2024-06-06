exports.addS = (val = 0) => {
  if (isNaN(Number(val))){
    throw new Error("AddS: val must be numeric");
  }
  let plural = "";
  if (val > 1 || val <= 0) {
    plural = "s";
  }
  return plural;
}

exports.requestFilter = (key, val) => {
  if (!key ) {
    throw new Error("requestFilter: valid key and val are required");
  }

  return {
    filterKey: key,
    filterVal: val,
  };
  
};