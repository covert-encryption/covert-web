import { zxcvbn, ZxcvbnOptions } from "@zxcvbn-ts/core"
import zxcvbnCommonPackage from "@zxcvbn-ts/language-common"
import zxcvbnEnPackage from "@zxcvbn-ts/language-en"
import TimeEstimates from "@zxcvbn-ts/core/dist/TimeEstimates.js"

const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};

ZxcvbnOptions.setOptions(options)


export const estimate = (pw) => {
    return zxcvbn(pw)
}

export const displayCrackTime = (seconds) => {
  let timeEst = new TimeEstimates()
  return timeEst.displayTime(seconds)
}