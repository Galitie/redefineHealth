let callCounter = 0
const ss = SpreadsheetApp.getActiveSpreadsheet()
let dataLength = 0
let options = {
  method: 'GET',
  'headers' : {
    'x-api-key' : 'secret key'
  },
}


function getQuizIDs(){
  let url = "https://www.flexiquiz.com/api/v1/quizzes/"
  let mainSheet = ss.getSheetByName("quizIDs")
  let response = UrlFetchApp.fetch(url, options);
  let json = response.getContentText()
  let data = JSON.parse(json)
  mainSheet.clear()
  let headers = [['Quiz Name', 'Quiz ID', 'Date Quiz Created']]
  mainSheet.getRange(1,1,headers.length, headers[0].length).setValues(headers)
  
  let dataArr = []
  for (let i = 0; i < data.length; i++){
    details = [
      data[i].name,
      data[i].quiz_id,
      data[i].date_created.split(" ")[0].split("-").join('')
    ]
    dataArr.push(details)
  }

  mainSheet.getRange(2,1,data.length,dataArr[0].length).setValues(dataArr)
  getRawData()
}


function getRawData(){
  let quizIDSheet = ss.getSheetByName("quizIDs")
  let mainSheet = ss.getSheetByName("rawData")
  let idLastRow = quizIDSheet.getLastRow()
  let quizID = quizIDSheet.getRange(2,2, idLastRow)
  let quizIDValues = quizID.getValues()

  mainSheet.clear()
  let headers = [['State','Date response submitted','Month Submitted', 'Year Submitted', 'Quiz ID', 'Quiz Name', 'Profession', 'License', 'Pass', 'Course Completed Date']]
  mainSheet.getRange(1,1,headers.length, headers[0].length).setValues(headers)

  let dataArr = []

  for (i=0; i < idLastRow - 1; i++){
    // These calls are about 1 min
    let currentQuizID = quizIDValues[i].toString()
    Logger.log(`Current Quiz ID: ${currentQuizID}`)
    let url = `https://www.flexiquiz.com/api/v1/quizzes/${currentQuizID}/responses`
    let response = UrlFetchApp.fetch(url,options)
    let json = response.getContentText()
    let data = JSON.parse(json)
    Logger.log(`Amount of responses: ${data.length}`)
    
    if (data.length > 0){
      for (let j=0; j < data.length; j++){
        let checkforSubmittedDate = data[j].date_submitted
        let quizIDForSubmission = data[j].quiz_id
        let quizName = data[j].quiz_name
        let pass = data[j].pass
        let license = "not yet, or see State"
        let courseCompletedDate
        let registrationFields = Object.values(data[j].registration_fields)
        let regArr = Object.values(registrationFields)
        let test = regArr.find(element => element.name.includes("State"))
        let test2 = regArr.find(element => element.name.includes("Professional Designation"))
        let test3 = regArr.find(element => element.name.includes("Date of Completion"))
        let test4 = regArr.find(element => element.name.includes("Completed"))
        let test5 = regArr.find(element => element.name.includes("License"))

        if (checkforSubmittedDate !== null){
          dateSubmitted = checkforSubmittedDate.split(" ")[0]
          yearSubmitted = dateSubmitted.split("-")[0]
          monthSubmitted = dateSubmitted.split("-")[1]
        } else {
          dateSubmitted = "Response not submitted"
          yearSubmitted = dateSubmitted
          monthSubmitted = dateSubmitted
        }

        if (test !== undefined){
          state = test.value
        } else {
          state = "State question wasn't included in this response"
        }

        if (test2 !== undefined){
          profession = test2.value
        } else {
          profession = "N/A"
        }

        if (test3 !== undefined){
          courseCompletedDate = test3.value
        } else if (test4 !== undefined){
          courseCompletedDate = test4.value
        }

        if (test5 !== undefined){
          license = test5.value
        }

        details = [
          state,
          dateSubmitted,
          monthSubmitted,
          yearSubmitted,
          quizIDForSubmission,
          quizName,
          profession,
          license,
          pass,
          courseCompletedDate
        ]
        dataArr.push(details)
      }
    }
  }
  mainSheet.getRange(2,1,dataArr.length,dataArr[0].length).setValues(dataArr)
  sortRawData()
}


function sortRawData(){
  // Goal is 33
  let rawDataSheet = ss.getSheetByName("rawData")
  let mainSheet = ss.getSheetByName("sortedRawData")
  let rawLastRow = rawDataSheet.getLastRow()
  let instructionsSheet = ss.getSheetByName("Instructions")
  let monthSelected = instructionsSheet.getRange(3,1).getValue()
  let yearSelected = instructionsSheet.getRange(3,2).getValue()

  let month = rawDataSheet.getRange(2,3,rawLastRow)
  let monthValue = month.getValues()

  let year = rawDataSheet.getRange(2,4,rawLastRow)
  let yearValue = year.getValues()

  let date = rawDataSheet.getRange(2,2,rawLastRow)
  let dateValue = date.getValues()

  let stateStuff = rawDataSheet.getRange(2,1,rawLastRow)
  let stateStuffValue = stateStuff.getValues()

  let profession = rawDataSheet.getRange(2,7,rawLastRow)
  let professionValue = profession.getValues()

  let pass = rawDataSheet.getRange(2,9,rawLastRow)
  let passValue = pass.getValues()

  let quizName = rawDataSheet.getRange(2,6,rawLastRow)
  let quizValue = quizName.getValues()

  let completedDate = rawDataSheet.getRange(2,10,rawLastRow)
  let completedDateValue = completedDate.getValues()

  let license = rawDataSheet.getRange(2,8,rawLastRow)
  let licenseValue = license.getValues()


  let dataArr = []
  
  mainSheet.clear()
  let headers = [['State', 'Date Response Submitted', 'Month Response Submitted', 'Year Response Submitted', 'Profession', 'Quiz Name', 'Course Completed Date', 'License', 'Pass']]
  mainSheet.getRange(1,1,headers.length, headers[0].length).setValues(headers)

  for(let i = 1; i < rawLastRow; i++){
    let isSelectedMonth = monthValue[i]
    let isSelectedYear = yearValue[i]
    let dateSubmitted = dateValue[i]
    let passingGrade = passValue[i].toString()
    let licenseNum = licenseValue[i]
    let nameOfQuiz = quizValue[i].toString()
    let courseCompletedDate = completedDateValue[i]
    let stateFlorida = stateStuffValue[i].toString()
    let professionCheck = professionValue[i].toString()
    stateConditions = ["fl", "florida"]
    let state = stateConditions.some(el => stateFlorida.toLowerCase().includes(el))
    let profConditions = ["pt", "pta", "physical", "occupational", "ota", "ot"]
    let profDes = profConditions.some(el => professionCheck.toLowerCase().includes(el))

    if (state == true && isSelectedMonth == monthSelected && isSelectedYear == yearSelected && profDes == true && passingGrade == "true"){
  
      details = [
        stateFlorida,
        dateSubmitted,
        isSelectedMonth,
        isSelectedYear,
        professionCheck,
        nameOfQuiz,
        courseCompletedDate,
        licenseNum,
        passingGrade
      ]
      dataArr.push(details)
    } 
  }

  // if (mainSheet.getLastRow() == 0){
  //   dataArr.push(["No submitted quiz results match criteria!"])
  // }

  mainSheet.getRange(2,1,dataArr.length,dataArr[0].length).setValues(dataArr)
  populateFinalResults()
}


function populateFinalResults(){
  // col 15
  let sortedRawDataSheet = ss.getSheetByName("sortedRawData")
  let mainSheet = ss.getSheetByName("Results")
  let sortedRawLastRow = sortedRawDataSheet.getLastRow()

  mainSheet.clearContents()
  let headers = [['CE Provider Tracking Number', 'Course Number', 'N/A', 'N/A', "License Number", "Course Completion Date", "State Indicator", "Profession Indicator", "Date Submitted", "Course Name"]]
  mainSheet.getRange(1,1,headers.length, headers[0].length).setValues(headers)

  let dataArr = []

  let course = sortedRawDataSheet.getRange(2,6,sortedRawLastRow)
  let courseValues = course.getValues()

  let license = sortedRawDataSheet.getRange(2,8,sortedRawLastRow)
  let licenseValue = license.getValues()

  let courseCom = sortedRawDataSheet.getRange(2,7,sortedRawLastRow)
  let courseComValue = courseCom.getValues()

  let dateSub = sortedRawDataSheet.getRange(2,2,sortedRawLastRow)
  let dateSubValue = dateSub.getValues()

  let prof = sortedRawDataSheet.getRange(2,5,sortedRawLastRow)
  let profValue = prof.getValues()

  let providerTrackingNum = 32784
  let empty1 = "N/A"
  let empty2 = "N/A"
  let stateInd = "State=FL"


  for (let i = 0; i < sortedRawLastRow - 1; i++){
    courseNum = courseValues[i]
    licenseNum = licenseValue[i]
    courseCompletedDate = courseComValue[i]
    profInd = profValue[i]
    dateSubmitted = dateSubValue[i]
    details = [
      providerTrackingNum,
      getCourseNum(courseNum),
      empty1,
      empty2,
      licenseNum,
      courseCompletedDate,
      stateInd,
      profInd,
      dateSubmitted,
      courseNum
    ]

    dataArr.push(details)
  
  }
  mainSheet.getRange(2,1,dataArr.length,dataArr[0].length).setValues(dataArr)
}


function getCourseNum(courseName){
  let index = 0
  let courseNumSheet = ss.getSheetByName("approvedCourses")
  let allNames = courseNumSheet.getRange("B:B").getValues()
  let courseNums = courseNumSheet.getRange("P:P").getValues()

  allNames.forEach((element, i) => {
    if (element.includes(courseName.toString()) || element.toString() == courseName.toString()){
      index = i
    } 
  })

  if (index == 0) {
    return `Couldn't find Course Num, check Course Name`
  } else {
    let uneditedCourseNums = courseNums[index]
    editedCourseNum = uneditedCourseNums.toString().split("-")[1]

    if (editedCourseNum.match(/^[0-9]+$/) == null){
      return `Couldn't find Course Num, check Course Name`
    }
    return editedCourseNum
    }
}
